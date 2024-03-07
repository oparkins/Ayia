import { get } from 'svelte/store';

import {
    versions,
    verse,
} from "$lib/stores";

const Ref_RE  = /^((?:[123] ?)?[^0-9.]+)[. ]*(?:([0-9]+)(?:[.:]([0-9]+))?)?$/;
const Book_RE = /^([123] ?)?([^0-9.]+)(?:[. ]*[0-9]+|$)/;

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
 *            { book, chapter, verse, full_book, ui_ref, api_ref }
 */
export function set_verse( verse_ref, apply_bounds = true ) {
  const versions_ro = get( versions );

  if (verse_ref == null || verse_ref.length < 3) {
    verse.set( null );
    return;
  }

  const match   = verse_ref.match( Ref_RE );
  if (! match) {
    verse.set( null );
    return;
  }

  const [ _all, bk, ch, vs ]  = match;

  // Convert the book name to title-case (first letter capitalized)
  if (bk[0] >= '1' && bk[0] <= '3') {
    // First character is numeric
  }

  const book  = find_book( bk );

  if (book == null) {
    console.error('set_verse( %s ): Unknown book[ %s ] ...',
                  verse_ref, bk);
    return;
  }

  /*
  console.log('set_verse( %s ): book[ %s ] =>',
              verse_ref, bk, book);
  // */

  // Validate bounds
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

  if (vs_num < 1) {
    if (! apply_bounds) { /* Invalid */ return }
    vs_num = 1;
  }
  if (vs_num > max_vers) {
    if (! apply_bounds) { /* Invalid */ return }
    vs_num = max_vers;
  }

  const ch_str  = (ch_num ? String(ch_num) : '');
  const vs_str  = (vs_num ? String(vs_num) : '');

  let ui_ref  = `${bk} ${ch_str}`;
  if (vs_num) {
    ui_ref += `:${vs_str}`;
  }

  let api_ref = `${book.abbr}.${ref_num(ch_num)}`;
  if (vs_num) {
    api_ref += `.${ref_num(vs_num)}`;
  }

  console.log('set_verse( %s ): [ %s, %s, %s ] => ui[ %s ], api[ %s ]',
              verse_ref, bk, ch, vs, ui_ref, api_ref);

  const data  = {
    book      : bk,
    chapter   : (ch_num || ''),
    verse     : (vs_num || ''),

    full_book : book,
    ui_ref,
    api_ref,
  };

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

  const versions_ro = get( versions );
  if (versions_ro == null || !Array.isArray(versions_ro.versions)) {
    // We don't yet have access to `versions`
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

  return String(num).padStart(3, '0');
}
