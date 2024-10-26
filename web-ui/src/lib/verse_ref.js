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
 */

/* Support various HTML dashes for separator
 *                  character   Unicode (hexadecimal)   HTML entity
 *  Hyphen          -           U+002d  (&#x0045);      -
 *  Unicode hyphen  ‐           U+2010  (&#x2010);      &dash; | &hyphen;
 *  Figure dash     ‒           U+2012  (&#x2012);
 *  En dash         –           U+2013  (&#x2013);      &ndash;
 *  Em dash         —           U+2014  (&#x2014);      &mdash;
 *  Horizontal bar  ―           U+2015  (&#x2015);      &horbar;
 *  minus sign      −           U+2212  (&#x2212);      &minus;
 */
const Dashes  =  [ '‐', '‒', '–', '—', '―', '\−', '\-' ];

// Verse Ref (range) Identification
const Ref_RE = new RegExp( [
    '^((?:[123] ?)?[^0-9.]+)',      // 1  : Book
    '[. ]*',
    '(?:',
      '([0-9]+)',                   // 2  : Chapter (from)
      '(?:[.:]([0-9]+))',           // 3  : Verse   (from)
    '?)?', // $ end of original
    `(?:([${Dashes.join('')}]?)`,   // 4  : Separator (dashes)
      '([0-9., ]+)',                // 5  : Verse (to allowing for a CSV of
                                    //             verses)
    ')?$',
  ].join(''));

// Book Identification
const Book_RE = new RegExp( [
    '^([123] ?)?',                                // 1  : Book Numeric
    '([^0-9.]+)',                                 // 2  : Book Non-Numweic
    `(?:[. ]*([0-9:., ${Dashes.join('')}]+)|$)`,  // 3  : Chapter/Verse (range)
  ].join(''));

/**
 *  A validated verse reference
 *
 *  @class  VerseRef
 */
export class VerseRef {
  verse_ref = null;   // The original verse reference {String};
  is_valid  = false;  // Indicator of verse validity {Boolean};
  book      = null;   // The full book reference {Book};
  chapter   = null;   // The chapter number {Number};
  verses    = [];     // The set of verses {Array[Number]]};
  ui_ref    = null;   // A human readable UI reference {String};
  url_ref   = null;   // The full URL for this reference {String};

  /**
   *  Create a new, validated instance.
   *
   *  @constructor
   *  @param  verse_ref               The incoming verse reference {String};
   *  @param  versions                The full set of versions {Object};
   *  @param  [apply_bounds = true]   If truthy and the chapter or verse are
   *                                  out-of-bounds, update them to be within
   *                                  bounds. Otherwise, the reference is
   *                                  invalid {Boolean};
   */
  constructor( verse_ref, versions, apply_bounds = true ) {
    this.verse_ref = verse_ref;

    const data  = parse_verse( verse_ref, versions, apply_bounds );

    if (data) {
      this.is_valid  = true;
      this.book      = data.full_book;
      this.chapter   = data.chapter;
      this.verses    = data.verses;
      this.ui_ref    = data.ui_ref;
      this.url_ref   = data.url_ref;
    }
  }

  /**
   *  Update the verse(s) for this reference, modifying the necessary state.
   *
   *  @method update_verses
   *  @param  verses    The new set of verses {Array[Number]};
   *
   *  @return void
   */
  update_verses( verses ) {
    if (Array.isArray( verses )) {
      // Ensure the incoming verses are sorted
      verses.sort( (a,b) => a - b );

    } else {
      verses = [];
    }

    this.verses  = verses;
    this.ui_ref  = generate_ui_ref(  this.book, this.chapter, verses );
    this.url_ref = generate_url_ref( this.book, this.chapter, verses );
  }
}

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

  /* Parse the reference to book name, chapter, first verse, any dash
   * separator, to verse(s) (possibly a CSV list)
   */
  const match   = verse_ref.match( Ref_RE );
  if (! match) {
    return;
  }

  const [ _all, bk, ch, from_vs, dash, to_vs ] = match;

  /*
  console.log('parse_verse( %s ): bk[ %s ], ch[ %s ], from_vs[ %s ], '
              +                     'dash[ %s ], to_vs[ %s ]',
              verse_ref, bk, ch, from_vs, dash, to_vs);
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
  const is_valid  = _validate_ref( book, ch, from_vs, apply_bounds );
  if (! is_valid) { return }

  const ch_num  = is_valid.chapter;
  let   vs_num  = is_valid.verse;
  let   verses  = (vs_num ? [ vs_num ] : []);

  if (vs_num != null && to_vs != null) {
    const have_range  = Dashes.includes( dash );

    // Include a (set of) to verse(s)
    to_vs.split( /\s*,\s*/ ).forEach( (str, idex) => {
      const is_valid  = _validate_ref( book, ch, str );

      if (is_valid && is_valid.verse) {
        if (idex === 0 && have_range) {
          // Include verses between vs_num and this one.
          for (let jdex = vs_num + 1; jdex < is_valid.verse; jdex++) {
            verses.push( jdex );
          }
        }

        verses.push( is_valid.verse );
      }
    });

    // Sort verses in ascending order
    verses.sort( (a,b) => a - b );

    vs_num = verses[0];
  }

  const data  = {
    book      : bk,
    chapter   : (ch_num || ''),
    verse     : (vs_num || ''),
    verses,

    full_book : book,
    ui_ref    : generate_ui_ref(  book, ch_num, verses ),
    url_ref   : generate_url_ref( book, ch_num, verses ),
  };

  /*
  console.log('parse_verse( %s ): data:', verse_ref, data);
  // */

  return data;
}

/**
 *  Given a book, chapter number, and set of verses, generate a human readable
 *  UI reference/label for the verse (range).
 *
 *  @method generate_ui_ref
 *  @param  book    The full book information for the target book {Object};
 *  @param  chapter The chapter number {Number};
 *  @param  verses  The sorted set of verses {Array[Number]};
 *
 *  @return The human readable, UI reference {String};
 */
export function generate_ui_ref( book, chapter, verses ) {
  /* Collapse verses into a first verse, any initial range, and a following CSV
   * of additional verses.
   */
  const ch_str    = String( chapter ).trim();
  let   ui_ref    = `${book.name} ${ch_str}`;

  if (Array.isArray(verses) && verses.length > 0) {
    const vs1       = verses[0];
    let   range_end;
    for (let idex = 1; idex < verses.length; idex++) {
      const vs  = verses[idex];
      if (vs !== vs1 + idex) {
        // End of range
        break;
      }
      range_end = idex;
    }

    let   csv_verses  = [];
    const vs1_str     = String( vs1 ).trim();
    ui_ref += `:${vs1_str}`;
    if (range_end) {
      const vs2_str = String( verses[range_end] ).trim();

      ui_ref     += `-${vs2_str}`;
      csv_verses  = verses.slice( range_end + 1 );

    } else {
      csv_verses = verses.slice( 1 );
    }

    if (csv_verses.length > 0) {
      ui_ref += ',' + csv_verses.map( vs => String(vs).trim() ).join(',');
    }
  }

  return ui_ref;
}

/**
 *  Given a book, chapter number, and set of verses, generate a URL reference
 *  for the verse (range).
 *
 *  @method generate_url_ref
 *  @param  book    The full book information for the target book {Object};
 *  @param  chapter The chapter number {Number};
 *  @param  verses  The sorted set of verses {Array[Number]};
 *
 *  @return The human readable, UI reference {String};
 */
export function generate_url_ref( book, chapter, verses ) {
  /* Collapse verses into a first verse, any initial range, and a following CSV
   * of additional verses.
   */
  const ch_str    = ref_num( chapter );
  let   url_ref   = `${book.abbr}.${ch_str}`;

  if (Array.isArray(verses) && verses.length > 0) {
    const vs1       = verses[0];
    let   range_end;
    for (let idex = 1; idex < verses.length; idex++) {
      const vs  = verses[idex];
      if (vs !== vs1 + idex) {
        // End of range
        break;
      }
      range_end = idex;
    }

    let   csv_verses  = [];
    const vs1_str     = ref_num( vs1 );
    url_ref += `.${vs1_str}`;
    if (range_end) {
      const vs2_str = ref_num( verses[range_end] );

      url_ref    += `-${vs2_str}`;
      csv_verses  = verses.slice( range_end + 1 );

    } else {
      csv_verses = verses.slice( 1 );
    }

    if (csv_verses.length > 0) {
      url_ref += ',' + csv_verses.map( vs => ref_num( vs ) ).join(',');
    }
  }

  return url_ref;
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

  // First, search by abbreviation or full name match.
  let   book  = books.find( entry => {
    if (ABBR === entry.abbr)  { return true }
    if (entry.name === name)  { return true }
  });

  if (book == null) {
    // If not found, follup with a name prefix search
    book = books.find( entry => {
      if (entry.name.startsWith( name ))  { return true }
    });
  }

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

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Given book metadata along with chapter, and verse, validate chapter and
 *  verse.
 *
 *  @method _validate_ref
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
 *  @private
 */
function _validate_ref( book, ch, vs, apply_bounds = true ) {
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

/* Private helpers }
 ****************************************************************************/
