import { get } from 'svelte/store';

import {
    versions,
    verse,
} from "$lib/stores";

// Verse Ref (range) Identification
const Ref_RE = new RegExp( [
    '^((?:[123] ?)?[^0-9.]+)',// 1  : Book
    '[. ]*',
    '(?:',
      '([0-9]+)',             // 2  : Chapter (from)
      '(?:[.:]([0-9]+))',     // 3  : Verse   (from)
    '?)?', // $ end of original
    '(?:-',
      '([0-9., ]+)',          // 4  : Verse (to allowing for a CSV of verses)
    ')?$',
  ].join(''));

// Book Identification
const Book_RE = new RegExp( [
    '^([123] ?)?',              // 1  : Book Numeric
    '([^0-9.]+)',               // 2  : Book Non-Numweic
    '(?:[. ]*([0-9:., -]+)|$)', // 3  : Chapter/Verse (range)
  ].join(''));

/**
 *  Parse a verse string into an object.
 *
 *  @method parse_verse
 *  @param  verse_ref               The incoming verse reference {String};
 *  @param  [apply_bounds = true]   If truthy and the chapter or verse are
 *                                  out-of-bounds, update them to be within
 *                                  bounds. Otherwise, the reference is invalid
 *                                  {Boolean};
 *
 *  @note The supports parsing of a verse reference for a *single* chapter but
 *        with the option of a verse range.
 *
 *  @note The returned `ui_ref` and `url_ref` will reflect book, chapter, verse
 *        as well as any verse range.
 *
 *  @return The validated reference or undefined {Object};
 *            { book      : Extracted book name {String},
 *              chapter   : Extracted chapter {Number},
 *              verse     : First extracted verse {Number},
 *              verses    : Full set of referenced verses {Array};
 *              full_book : Full book information {Object};
 *              ui_ref    : A UI representation of this reference {String};
 *              url_ref   : A URL representation of this reference {String};
 *            }
 */
export function parse_verse( verse_ref, apply_bounds = true ) {
  if (verse_ref == null || verse_ref.length < 3) {
    return;
  }

  const match   = verse_ref.match( Ref_RE );
  if (! match) {
    return;
  }

  const [ _all, bk, ch, vs, vs2 ] = match;

  // Attempt to locate the book
  const book  = find_book( bk );
  if (book == null) {
    console.error('parse_verse( %s ): Unknown book[ %s ] ...',
                  verse_ref, bk);
    return;
  }

  /*
  console.log('parse_verse( %s ): book[ %s ] =>',
              verse_ref, bk, book);
  // */

  // Validate chapter and verse bounds
  const is_valid  = validate_ref( book, ch, vs );
  if (! is_valid) { return }

  const ch_num  = is_valid.chapter;
  const ch_str  = (ch_num ? String(ch_num) : '');
  let   vs_num  = is_valid.verse;
  let   vs_str  = (vs_num ? String(vs_num) : '');
  let   vs2_num = null;
  let   vs2_str = null;

  if (vs2 != null) {
    /* :TODO: If `vs2` has the form '#, #, #' then generate a full array of
     *        verses.
     */

    // Validate the end-verse bounds
    const is_valid  = validate_ref( book, ch_num, vs2 );
    if (is_valid) {
      // We have a verse range within the same chapter
      vs2_num = is_valid.verse;
      vs2_str = (vs2_num ? String(vs2_num) : '');

      if (vs2_num == vs_num) {
        // NO range
        vs2_num = null;
        vs2_str = null;

      } else if (vs2_num < vs_num) {
        // Revere the verses
        [ vs_num, vs2_num ] = [ vs2_num, vs_num ];
        [ vs_str, vs2_str ] = [ vs2_str, vs_str ];
      }
    }
  }

  // Generate both the ui and url reference strings
  let ui_ref  = `${book.name} ${ch_str.trim()}`;
  let url_ref = `${book.abbr}.${ref_num(ch_num)}`;
  let verses  = null;
  if (vs_num) {
    verses = [ vs_num ];
    ui_ref += `:${vs_str.trim()}`;
    url_ref += `.${ref_num(vs_num)}`;

    if (vs2_num) {
      // Include the range
      ui_ref  += `-${vs2_str.trim()}`;
      url_ref += `-${ref_num(vs2_num)}`;

      for (let verse = vs_num + 1; verse <= vs2_num; verse++) {
        verses.push( verse );
      }
    }
  }

  const data  = {
    book      : bk,
    chapter   : (ch_num || ''),
    verse     : (vs_num || ''),
    verses,

    full_book : book,
    ui_ref,
    url_ref,
  };

  // /*
  console.log('parse_verse( %s ): data:', verse_ref, data);
  // */


  return data;
}

/**
 *  Validating set for `verse`
 *
 *  @method set_verse
 *  @param  verse_ref               The incoming verse reference {String};
 *  @param  [apply_bounds = true]   If truthy and the chapter or verse are
 *                                  out-of-bounds, update them to be within
 *                                  bounds. Otherwise, the reference is invalid
 *                                  {Boolean};
 *
 *  @return The validated reference or undefined {Object};
 *            { book, chapter, verse, full_book, ui_ref, url_ref }
 */
export function set_verse( verse_ref, apply_bounds = true ) {
  const data  = parse_verse( verse_ref, apply_bounds );

  verse.set( data );

  return data;
}

/**
 *  Find the entry from `versions` for the named version.
 *
 *  @method find_version
 *  @param  name    The version name or abbreviation {String};
 *
 *  @return The version entry if found {Object};
 *            {id, abbreviation, title, local_abbreviation, local_title,
 *             language, type }
 */
export function find_version( name ) {
  if (typeof(name) !== 'string' || name.length < 3) {
    // `name` is not usable
    return;
  }

  // Ensure `versions` is available
  const versions_ro = get( versions );
  if (versions_ro == null || !Array.isArray(versions_ro.versions)) {
    // We don't yet have access to `$versions`
    return;
  }

  name = title_case( name );

  const name_no_ws  = name.replaceAll(/\s/g, '');
  const ABBR        = name.toUpperCase().slice(0,8);
  const version     = versions.versions.find( entry => {
    if (entry.abbreviation.startsWith( ABBR ))        { return true }
    if (entry.local_abbreviation.startsWith( ABBR ))  { return true }
    if (entry.title.startsWith( name ))               { return true }
    if (entry.local_title.startsWith( name ))         { return true }
  });

  return version;
}

/**
 *  Find the entry from `versions.books` for the named book.
 *
 *  @method find_book
 *  @param  name    The book name or abbreviation {String};
 *
 *  @return The book entry if found {Object};
 *            {abbr, name, order, loc, verses}
 */
export function find_book( name ) {
  if (typeof(name) !== 'string' || name.length < 3) {
    // `name` is not usable
    return;
  }

  // Ensure `versions.books` is available
  const versions_ro = get( versions );
  const books       = (versions_ro && versions_ro.books);
  if (! Array.isArray(books)) {
    // No `$versions.books` available
    return;
  }

  // Convert the name to title-case (which also condenses all white-space)
  name = title_case( name.trim() );

  const name_no_ws  = name.replaceAll(/\s/g, '');
  const ABBR        = name.toUpperCase().slice(0,3);
  const book        = books.find( entry => {
    if (ABBR === entry.abbr)            { return true }
    if (entry.name.startsWith( name ))  { return true }
  });

  return book;
}

/**
 *  Convert the book name to title-case (first letter capitalized)
 *
 *  @method title_case
 *  @param  name    The book name {String};
 *
 *  @return A title-cased version of `name` {String};
 */
export function title_case( name ) {
  if (typeof(name) !== 'string')  { return name }

  const match   = name.match( Book_RE );
  if (! match) {
    // Doesn't look like a book name...
    return name;
  }

  const [ _full, numeric, str ] = match;

  // Capitalize each word (> 2 characters)
  const words = str.toLowerCase().split(/\s+/);
  const book  = words.map( word => {
                  if (word.length < 3) { return word }
                  return word[0].toUpperCase() + word.slice(1);
                }).join(' ').trim();

  // Normalize any numeric prefix
  let prefix  = (numeric || '');

  if (prefix !== prefix.trim()) {
    // Condense trailing white-space to a single character;
    prefix = prefix.trim() + ' ';
  }

  return prefix + book;
}

/**
 *  Format an integer to a 3-digit string for us in an API verse reference.
 *
 *  @method ref_num
 *  @param  num   The source number {Number};
 *
 *  @return A formatted string {String};
 */
export function ref_num( num ) {
  /*
  if (typeof(num) === 'string') { num = parseInt( num ) }
  if (typeof(num) !== 'number' || Number.isNaN(num)) {
    console.warn('=== ref_num( %s ): Not a number', num);
    return String( num );
  }
  // */

  return String(num).trim().padStart(3, '0');
}

/**
 *  Given book metadata along with chapter, and verse, validate chapter and
 *  verse.
 *
 *  @method validate_ref
 *  @param  book                    The book metadata {Object};
 *  @param  ch                      The target chapter
 *                                  {Number | Numeric String};
 *  @param  vs                      The target verse {Number | Numeric String};
 *  @param  [apply_bounds = true]   If truthy and the chapter or verse are
 *                                  out-of-bounds, update them to be within
 *                                  bounds. Otherwise, the reference is invalid
 *                                  {Boolean};
 *
 *  @return The validated chapter and verse | undefined if invalid {Object};
 *            { chapter: {Number}, verse: {Number} }
 */
function validate_ref( book, ch, vs, apply_bounds = true ) {
  let   ch_num    = parseInt( ch );
  let   vs_num    = parseInt( vs );
  const max_chaps = book.verses.length - 1;

  if (Number.isNaN(ch_num) || ch_num < 1) {
    if (! apply_bounds) { /* Invalid */ return }
    ch_num = 1;
  }

  if (ch_num > max_chaps) {
    if (! apply_bounds) { /* Invalid */ return }
    ch_num = max_chaps;
  }

  const max_vers  = book.verses[ ch_num ];

  if (Number.isNaN(vs_num)) {
    vs_num = null;

  } else if (vs_num < 1) {
    if (! apply_bounds) { /* Invalid */ return }
    vs_num = 1;

  } else if (vs_num > max_vers) {
    if (! apply_bounds) { /* Invalid */ return }
    vs_num = max_vers;
  }

  return { chapter: ch_num, verse: vs_num };
}
