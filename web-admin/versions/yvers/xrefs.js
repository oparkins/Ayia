const Books   = require('../../lib/books');
const Refs    = require('../../lib/refs');

const Ref_RE  = _generate_Ref_RE();

/**
 *  Given an array of note.x or note.f text (cross-references or footnote),
 *  return a normalized version that splits out references from non-reference
 *  text.
 *
 *  @method normalize_xrefs
 *  @param  state           Chapter processing state {Object};
 *  @param  state.verbosity Verbosity level {Number};
 *  @param  state.usfm      The reference of the current verse {String};
 *  @param  texts           The set of text(s) {Array[String]};
 *
 *  USX allows for multiple cross-reference tags:
 *    tag   : Description                 : Example
 *    xo    : Origin reference            :   '2.23: '
 *                                        :   '3.0: '
 *                                        :   '1:1 '
 *    xop   : Origin text                 :   'Гл 1. (1) '
 *    xta   : Target reference added text :   'Compare with '
 *                                        :   'and'
 *                                        :   'parallel passages.'
 *    xt    : Target reference(s)         :   'Mk 1.1-8; Lk 3.1-18; '
 *                                        :   'Jn 1.19-28 '
 *                                        :   '4 Царств. 14:25.'
 *
 *  We will use a custom version of 'xt' representing a *single* target
 *  reference of the form:
 *    { xt: {
 *        text  : The raw text of the reference {String};
 *        usfm  : The normalized, USFM reference {String};
 *                (e.g. 'GEN.001.001', 'GEN.001.001,003', 'GEN.001.001-003')
 *      }
 *    }
 *
 *
 *  @return The set of texts along with new `xt` reference elements containing
 *          any normalized references for the preceeding text item {Array};
 *            [ text,
 *              {xt: { text, usfm }},
 *              text,
 *              {xt: { text, usfm }},
 *              ...
 *            ]
 *  @private
 */
function normalize_xrefs( state, texts ) {
  const loc                               = state.usfm;
  let   [ ini_book, ini_chap, ini_vers ]  = loc.split('.');

  const full_book   = Books.getBook( ini_book );
  const ini_abbr    = full_book.abbr;
  const ini_verses  = (Array.isArray( full_book.verses ) && full_book.verses);
  const ref_state = {
    /************************************************
     * Non-resetable {
     *
     */
    norm      : [],
    last_text : null,
    remain    : '',
    skip      : null,
    /* Non-resetable }
     ************************************************
     * Resetable {
     *
     */
    book      : ini_abbr,
    chap      : ini_chap,
    vers      : ini_vers,

    sep       : null,
    to_vers   : null,

    verses    : ini_verses,
    num_chaps : (ini_verses ? ini_verses.length - 1  : -1),
    num_vers  : (ini_verses ? ini_verses[ ini_chap ] : -1),
    /* Resetable }
     ************************************************/

    _reset    : function _reset() {
      // :XXX: Leave 'norm', 'last_text', 'remain', and 'skip' alone
      this.book      = ini_abbr;
      this.chap      = ini_chap;
      this.vers      = ini_vers;

      this.sep       = null;
      this.to_vers   = null;

      this.verses    = ini_verses;
      this.num_chaps = (ini_verses ? ini_verses.length - 1  : -1);
      this.num_vers  = (ini_verses ? ini_verses[ ini_chap ] : -1);
    },
  };

  //ref_state._reset();

  // Walk through all text elements extracting any references from each
  texts.forEach( (text, tdex) => {
    if (typeof(text) !== 'string') {
      // Push this non-text item directly to the normalized set
      _push_item( ref_state, text );
      return;
    }

    // Collapse white-space and identify references
    const norm_text = text.replaceAll(/\s+/g, ' ');
    const matches   = [...norm_text.matchAll( Ref_RE )];

    if (state.verbosity > 1) {
      console.log('>>> Normalize Xrefs: text   :', norm_text);
      console.log('>>> Normalize Xrefs: matches:', matches );
    }

    if (matches) {
      // Extract references
      ref_state.remain = norm_text;

      matches.forEach( (match, mdex) => {
        const text  = match[0];
        const book  = match.groups.book;
        let   fr_ch = match.groups.fr_ch;
        let   fr_vs = match.groups.fr_vs;
        const sep   = match.groups.sep;
        const to    = match.groups.to;
        const first = ref_state.remain.indexOf( text );
        let   ref   = ':TODO:';

        if (ref_state.skip && text === ref_state.skip) {
          if (state.verbosity > 1) {
            console.log('=== Normalize Xrefs: match %d: SKIP [%s] ...',
                        mdex, text);
          }

          ref_state.skip = null;
          return;
        }

        if (state.verbosity > 1) {
          console.log('>>> Normalize Xrefs: match %d: text [%s] ...',
                      mdex, text);
        }

        /* Remove this reference match from the source text, ensuring any
         * interveening text is not lost.
         */
        if (first === 0) {
          /* No interveening text -- simply remove this match from the
           * remaining text.
           */
          const orig  = ref_state.remain;
          ref_state.remain = ref_state.remain.slice( text.length );

        } else if (first > 0) {
          // Add interveening text as raw text
          const len   = first;
          const orig  = ref_state.remain;
          const str   = ref_state.remain.slice( 0, len );

          _push_item( ref_state, str );

          /* Remove the interveening text AND this match from the remaining
           * text.
           */
          ref_state.remain = ref_state.remain.slice( len + text.length );
        }

        /******************************************************
         * Process any identified book
         *
         */
        if (book && (book[0] === 'v' || book[0] === 'V')) {
          /* This is a "verse" item with no book or chapter identification that
           * is in relation to the source reference so reset book and chapter
           * state.
           */
          ref_state._reset();

        } else if (book && (book[0] === 'c' || book[0] === 'C')) {
          /* This is a "chapter" item with no book or verse identification that
           * is in relation to the source reference so reset book and verse
           * state.
           *
           */
          ref_state._reset();

          // Ensure 'fr_ch' is populated and 'fr_vs' is empty.
          if (fr_ch == null && fr_vs != null) {
            if (state.verbosity > 1) {
              console.log('=== Normalize Xrefs: Chapter reference: '
                          +         'move fr_vs[ %s ] to fr_ch',
                          fr_vs);
            }

            fr_ch = fr_vs;
            fr_vs = null;

            // Reset the current verse
            ref_state.vers = null;
          }

        } else if (book) {
          // New book -- validate the book identification
          const abbr      = Books.nameToABBR( book );
          const full_book = Books.getBook( abbr );
          if (full_book) {
            // Valid book
            const verses = (Array.isArray( full_book.verses ) &&
                            full_book.verses);

            /* If we have a book and verse but no chapter then we've
             * mis-identified the target chapter as a verse so adjust.
             */
            if (fr_ch == null && fr_vs != null) {
              if (state.verbosity > 1) {
                console.log('=== Normalize Xrefs: Book/chapter, no verse: '
                            +         'move fr_vs[ %s ] to fr_ch',
                            fr_vs);
              }

              fr_ch = fr_vs;
              fr_vs = null;

              // Reset the current verse
              ref_state.vers = null;
            }

            // Reset our chapter and verse counts
            ref_state.book      = full_book.abbr;
            ref_state.verses    = verses;
            ref_state.num_chaps = (verses ? verses.length - 1        : -1);
            ref_state.num_vers  = (verses ? verses[ ref_state.chap ] : -1);

            if (state.verbosity > 2) {
              console.log('>>> Normalize Xrefs: New book [ %s : %s ], '
                          +       '%d chapters',
                          book, abbr, ref_state.num_chaps);
            }

          } else if (state.verbosity > 1) {
            console.warn('*** Normalize Xrefs: book [ %s : %s ] '
                        +       'is NOT a valid book',
                        book, abbr);
          }
        }

        /******************************************************
         * Process any identified chapter (from)
         *
         */
        if (fr_ch) {
          // New chapter -- validate the chapter number
          const num = parseInt( fr_ch );

          /* :XXX: For now, this will consider references to books that have no
           *       chapter/verse counts as invalid.
           *
           *       To *allow* references to such books, change the final or
           *       below to:
           *        (ref_state.num_chaps > 0 && num > ref_state.num_chaps)
           */
          if (Number.isNaN( num ) || num < 0 || num > ref_state.num_chaps) {
            if (state.verbosity > 1) {
              console.warn('*** Normalize Xrefs: text[ %s ]: fr_ch[ %s ] '
                            +         'NOT valid [1..%s]',
                            text, fr_ch, ref_state.num_chaps);
            }

            /* Consume this text along wth any immediately following
             * verse/range characters.
             */
            _consume_invalid_range( ref_state, text );
            return;
          }

          // Update chapter number and verse count
          ref_state.chap     = num;
          ref_state.num_vers = (ref_state.verses
                                  ? ref_state.verses[ num ]
                                  : -1);

          if (state.verbosity > 2) {
            console.log('>>> Normalize Xrefs: New chapter [ %s : %s ], '
                        +       '%d verses',
                        fr_ch, num, ref_state.num_vers);
          }
        }

        /******************************************************
         * Process any identified verse (from)
         *
         */
        if (fr_vs) {
          // New verse -- validate the verse number
          const num = parseInt( fr_vs );

          /* :XXX: For now, this will consider references to books that have no
           *       chapter/verse counts as invalid.
           *
           *       To *allow* references to such books, change the final or
           *       below to:
           *        (ref_state.num_vers > 0 && num > ref_state.num_vers)
           */
          if (Number.isNaN( num ) || num < 0 || num > ref_state.num_vers) {
            if (state.verbosity > 1) {
              console.warn('*** Normalize Xrefs: text[ %s ]: fr_vs[ %s ] '
                            +         'NOT valid [1..%s]',
                            text, fr_vs, ref_state.num_vers);
            }

            /* Consume this text along wth any immediately following
             * verse/range characters.
             */
            _consume_invalid_range( ref_state, text );
            return;
          }

          // Update verse number
          ref_state.vers = num;
        }

        /******************************************************
         * Pass along any identified separator and/or to_vers
         *
         */
        ref_state.sep     = sep;
        ref_state.to_vers = to;

        if (state.verbosity > 2) {
          console.log('>>> Normalize Xrefs: match %d "%s":',
                      mdex, text, match.groups);
        }

        _push_ref( ref_state, text );
      });

      if (ref_state.remain.length > 0) {
        _push_item( ref_state, ref_state.remain );
      }

    } else {
      _push_item( ref_state, text );
    }
  });

  return ref_state.norm;
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Consolidate the generation of the regular expression used to identify
 *  cross-references.
 *
 *  @method _generate_Ref_RE
 *
 *  @return The full cross-reference regular expression {RegExp};
 *  @private
 */
function _generate_Ref_RE() {
  // Fetch all books from all locations (e.g. Old/New Testament)
  const book_map = Books.getBooks( '*' );

  /*
  console.log('book_map:', inspect(book_map));
  // */

  // Generate regular expression strings to identify valid books
  const book_re  = book_map.reduce( (ar, book) => {
    // Skip entries with no `match` RegExp or that are "Non scripture"
    if (book.match == null || book.loc === 'Non scripture') {
      return ar;
    }

    // Escape any RegExp characters from book.name
    const safe_name = book.name.replace(/([(.)])/g, '\\$1');
    const lc_abbr   = book.abbr.toLowerCase();
    const lc_name   = safe_name.toLowerCase();

    /* Extract the `match` RegExp source, removing any ^ and $ anchors
     * and converting any capture     groups '(...)'
     *                to  non-capture groups '(?:...)'.
     */
    const re  = book.match.source
                  .replaceAll(/\^|\$/g, '')           // Remove anchors
                  .replaceAll(/\(([^?])/g, '(?:$1');  // Convert capture groups

    /*
    console.log('match[ %s ] => [ %s ]',
                book.match.source, re);
    // */

    /* Include the official abbreviation and escaped name in addition to the
     * non-anchored RegExp
     */
    ar.push( lc_abbr, lc_name, re );

    return ar;
  }, []);

  // Include entries to catch verse and chapter identifiers as a "book"
  book_re.push( 'v', 'ver', 'verse', 'c', 'ch', 'chapter' );

  // Generate the full, final reference regular expression
  const ref_re  = new RegExp( [
                                                // 1  : Book
    `(?:(?:^|[ (])(?<book>${book_re.join('|')})(?:[. ]+))?`,
    '(?:',
      '(?:(?<fr_ch>[1]?[0-9]{1,2})[.: ]+)?',    // 2  : Chapter (from)
      '(?<fr_vs>[1]?[0-9]{1,2})',               // 3  : Verse   (from)
      '(?:',
        '(?<sep>[-,])',                         // 4  : Separator
        '(?<to>[0-9., ]+)',                     // 5  : Verse   (to)
      ')?',
    ')',
  ].join(''), 'ig');

  return ref_re;
}

/**
 *  An invalid chapter/verse range has been detected. Move it along with any
 *  immediately following range characters to the previous text item and update
 *  state to ignore the next match that may be realted to this range.
 *
 *  @method _consume_invalid_range
 *  @param  state           The current reference state {Object};
 *  @param  state.book      Current book abbreviation {String};
 *  @param  state.chap      Current chapter {Number};
 *  @param  state.vers      Current verse {Number};
 *  @param  state.sep       Any range separator {String};
 *  @param  state.to_vers   End of range {String};
 *  @param  state.verses    The chapter array with verse counts
 *                          {Array[Number]};
 *  @param  state.num_chaps The number of chapters in the current book
 *                          {Number};
 *  @param  state.num_vers  The number of verses in the current book/chapter
 *                          {Number};
 *
 *  @param  state.norm      The normalized set {Array};
 *  @param  state.remain    The remaining text to be parsed {String};
 *  @param  state.skip      Characters to skip in the next match {String};
 *  @param  state.last_text The index of the previous text item {Number};
 *  @param  text            The text of the identified invalid range {String};
 *
 *  @return The sortable reference {String};
 *  @private
 */
function _consume_invalid_range( state, text ) {
  const re_range  = /^(?<range>[0-9,-]+)/;

  /* Consume this text along wth any immediately following verse/range
   * characters.
   */
  let   append  = text;
  const match   = state.remain.match( re_range );
  const range   = (match && match.groups.range);
  if (range) {
    // Include additional verse/range characters from `remain`
    append += range;

    // Setup to skip any following match that uses `range`
    state.skip = range;

    // Remove the range from the remaining text to be parsed
    state.remain = state.remain.slice( range.length );

  } else {
    // No additional verse/range characters (invalidates any existing skip)
    state.skip = null;
  }

  // Append the range-related text
  _push_item( state, append );

  state._reset();

  return state;
}

/**
 *  Generate a sortable reference based upon the current reference state.
 *
 *  @method _generate_ref
 *  @param  state           The current reference state {Object};
 *  @param  state.book      Current book abbreviation {String};
 *  @param  state.chap      Current chapter {Number};
 *  @param  state.vers      Current verse {Number};
 *  @param  state.sep       Any range separator {String};
 *  @param  state.to_vers   End of range {String};
 *  @param  state.verses    The chapter array with verse counts
 *                          {Array[Number]};
 *  @param  state.num_chaps The number of chapters in the current book
 *                          {Number};
 *  @param  state.num_vers  The number of verses in the current book/chapter
 *                          {Number};
 *
 *  @param  state.norm      The normalized set {Array};
 *  @param  state.remain    The remaining text to be parsed {String};
 *  @param  state.skip      Characters to skip in the next match {String};
 *  @param  state.last_text The index of the previous text item {Number};
 *
 *  @return The sortable reference {String};
 *  @private
 */
function _generate_ref( state ) {
  let ref = Refs.sortable( state.book, state.chap, state.vers );

  if (state.sep && state.to_vers) {
    const trimmed = state.to_vers.trim();

    if (trimmed) {
      if (state.sep === '-') {
        // Simple range
        ref += '-'+ Refs.num( trimmed );

      } else if (state.sep === ',') {
        // CSV set of verses
        const nums  = trimmed.split(/\s*,\s*/).map( str => Refs.num( str ));

        ref += ','+ nums.join(',');
      }
    } else if (state.remain) {
      // Move the 'to' text BACK to the remaining text
      state.remain = state.to_vers + state.remain;
    }
  }

  // Reset the separator/to_vers
  state.sep     = null;
  state.to_vers = null;

  return ref;
}

/**
 *  Add a new item, possibly text, to the normalized set.
 *
 *  @method _push_item
 *  @param  state           The current reference state {Object};
 *  @param  state.book      Current book abbreviation {String};
 *  @param  state.chap      Current chapter {Number};
 *  @param  state.vers      Current verse {Number};
 *  @param  state.sep       Any range separator {String};
 *  @param  state.to_vers   End of range {String};
 *  @param  state.verses    The chapter array with verse counts
 *                          {Array[Number]};
 *  @param  state.num_chaps The number of chapters in the current book
 *                          {Number};
 *  @param  state.num_vers  The number of verses in the current book/chapter
 *                          {Number};
 *
 *  @param  state.norm      The normalized set {Array};
 *  @param  state.remain    The remaining text to be parsed {String};
 *  @param  state.skip      Characters to skip in the next match {String};
 *  @param  state.last_text The index of the previous text item {Number};
 *  @param  text            The text to add {String};
 *
 *  @return The updated `state` {Object};
 *  @private
 */
function _push_item( state, text ) {
  if (typeof(text) === 'string') {
    if (state.last_text != null && state.last_text >= 0) {
      // Append this to the previous text item
      state.norm[ state.last_text ] += text;
      return state;
    }

    // Remember the location of this text item
    state.last_text = state.norm.length;

  } else {
    // Since this item is not text, clear the `last_text` index
    state.last_text = null;
  }

  state.norm.push( text );

  return state;
}

/**
 *  Generate a new reference from the current state and push it onto the
 *  normalized set.
 *
 *  @method _push_ref
 *  @param  state           The current reference state {Object};
 *  @param  state.book      Current book abbreviation {String};
 *  @param  state.chap      Current chapter {Number};
 *  @param  state.vers      Current verse {Number};
 *  @param  state.sep       Any range separator {String};
 *  @param  state.to_vers   End of range {String};
 *  @param  state.verses    The chapter array with verse counts
 *                          {Array[Number]};
 *  @param  state.num_chaps The number of chapters in the current book
 *                          {Number};
 *  @param  state.num_vers  The number of verses in the current book/chapter
 *                          {Number};
 *
 *  @param  state.norm      The normalized set {Array};
 *  @param  state.remain    The remaining text to be parsed {String};
 *  @param  state.skip      Characters to skip in the next match {String};
 *  @param  state.last_text The index of the previous text item {Number};
 *  @param  text            The text of the reference {String};
 *
 *  @return The updated `state` {Object};
 *  @private
 */
function _push_ref( state, text ) {
  // RegExp to identify non-word prefix, word, and non-word suffix
  const re    = /^(?<pre>[^\w]*)(?<word>.*?)(?<suf>[^\w]*)$/;
  const match = text.match( re );
  const pre   = (match && match.groups && match.groups.pre);
  const word  = (match && match.groups && match.groups.word);
  const suf   = (match && match.groups && match.groups.suf);


  if (pre != null && pre.length > 0) {
    // Move the non-word prefix to the previous text item, or create one.
    _push_item( state, pre );
  }

  if (word != null && word != text) {
    // Reduce the reference text to the word portion
    text = word;
  }

  const usfm  = _generate_ref( state );
  /*
  console.log('_push_ref(): text[ %s ], usfm[ %s ] ...', text, usfm);
  // */

  state.norm.push( { xt: { text, usfm } } );

  state.last_text = null;

  if (suf != null && suf.length > 0) {
    // Move the non-word suffix a new text item
    _push_item( state, suf );
  }

  return state;
}
/* Private helpers }
 ****************************************************************************/

module.exports  = {
  normalize : normalize_xrefs,
};
