/**
 *  The full set of versions required by several methods should have the form:
 *    { total:  {Number};
 *      versions: [
 *        { id, abbreviation, local_abbreviation,
 *          title, local_title, type, vrs, language{},
 *        }
 *        ...
 *      ],
 *      books: [
 *        { abbr, name, order, loc, verses[] },
 *        ...
 *      ],
 *    }
 *
 *  import { get }              from 'svelte/store';
 *  import { versions, verse }  from "$lib/stores";
 *
 */

// Verse Ref (range) Identification
const Ref_RE = new RegExp( [
    '^((?:[123] ?)?[^0-9.]+)',// 1  : Book
    '[. ]*',
    '(?:',
      '([0-9]+)',             // 2  : Chapter (from)
      '(?:[.:]([0-9]+))',     // 3  : Verse   (from)
    '?)?', // $ end of original
    '(?:(-?)',                // 4  : Separator (-)
      '([0-9., ]+)',          // 5  : Verse (to allowing for a CSV of verses)
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
 *  @param  versions                The full set of versions {Object};
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
export function parse_verse( verse_ref, versions, apply_bounds = true ) {
  if (verse_ref == null || verse_ref.length < 3) {
    return;
  }

  const match   = verse_ref.match( Ref_RE );
  if (! match) {
    return;
  }

  const [ _all, bk, ch, vs, sep, vs2 ] = match;

  /*
  console.log('parse_verse( %s ): bk[ %s ], ch[ %s ], vs[ %s ], '
              +                     'sep[ %s ], vs2[ %s ]',
              verse_ref, bk, ch, vs, sep, vs2);
  // */

  // Attempt to locate the book
  const book  = find_book( bk, versions );
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
  let   verses  = null;
  let   verses2 = [];

  if (vs_num != null && vs2 != null) {
    // Handle a verse set as a range and/or CSV list
    verses2 = vs2.split( /\s*,\s*/ )
                .map( vs => {
                  const is_valid  = validate_ref( book, ch, vs );
                  return (is_valid && is_valid.verse);
                })
                .filter( vs => (vs != null) );

    verses = [];
    if (sep === '-') {
      // This is a range
      vs2_num = verses2.shift();
      vs2_str = String( vs2_num );

      if (vs2_num < vs_num) {
        // Revere the verses
        [ vs_num, vs2_num ] = [ vs2_num, vs_num ];
        [ vs_str, vs2_str ] = [ vs2_str, vs_str ];
      }

      vs2_str = `-${vs2_str}`;
      for (let verse = vs_num; verse <= vs2_num; verse++) {
        verses.push( verse );
      }

      if (verses2.length > 0) {
        vs2_str += `,${verses2.join(',')}`;

        verses = [ ...verses, ...verses2 ];
      }

    } else {
      verses = [ vs_num, ...verses2 ];

      vs2_str = `,${verses2.join(',')}`;
    }

  } else if (vs_num != null) {
    verses = [ vs_num ];
  }

  // Generate both the ui and url reference strings
  let ui_ref  = `${book.name} ${ch_str.trim()}`;
  let url_ref = `${book.abbr}.${ref_num(ch_num)}`;
  if (vs_num) {
    ui_ref += `:${vs_str.trim()}`;
    url_ref += `.${ref_num(vs_num)}`;

    if (vs2_str) {
      // Include the range/CSV list
      ui_ref  += `${vs2_str.trim()}`;

      if (sep === '-') {
        url_ref += `-${ref_num(vs2_num)}`;
      }

      if (verses2.length > 0) {
        url_ref += ',' + verses2.map( vs => ref_num( vs ) ).join(',');
      }
    }
  }

  /*
  console.log('parse_verse( %s ): verses2[ %s ], verses[ %s ]',
              verse_ref, verses2.join(', '), verses.join(', '));
  console.log('parse_verse( %s ): ui_ref[ %s ]',
              verse_ref, ui_ref);
  console.log('parse_verse( %s ): url_ref[ %s ]',
              verse_ref, url_ref);
  // */

  const data  = {
    book      : bk,
    chapter   : (ch_num || ''),
    verse     : (vs_num || ''),
    verses,

    full_book : book,
    ui_ref,
    url_ref,
  };

  /*
  console.log('parse_verse( %s ): data:', verse_ref, data);
  // */

  return data;
}

/**
 *  Find the entry from `versions` for the named version.
 *
 *  @method find_version
 *  @param  name      The version name or abbreviation {String};
 *  @param  versions  The full set of versions {Object};
 *
 *  @return The version entry if found {Object};
 *            {id, abbreviation, title, local_abbreviation, local_title,
 *             language, type }
 */
export function find_version( name, versions ) {
  if (typeof(name) !== 'string' || name.length < 3) {
    // `name` is not usable
    return;
  }
  if (versions == null || !Array.isArray(versions.versions)) {
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
 *  @param  name      The book name or abbreviation {String};
 *  @param  versions  The full set of versions {Object};
 *
 *  @return The book entry if found {Object};
 *            {abbr, name, order, loc, verses}
 */
export function find_book( name, versions ) {
  const books = (versions && versions.books);

  if (typeof(name) !== 'string' || name.length < 3) {
    // `name` is not usable
    return;
  }
  if (! Array.isArray( books )) {
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
