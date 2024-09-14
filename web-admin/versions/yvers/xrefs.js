const Books   = require('../../lib/books');
const Refs    = require('../../lib/refs');

/* The set of Unicode Characters that may be used for a dash:
 *  character           Unicode (hexadecimal) HTML entity
 *  hyphen  ‐           U+2010  (&#x2010;) ‐  &dash; ‐
 *                                            &hyphen; ‐
 *  Figure dash ‒       U+2012  (&#x2012;) ‒
 *  En dash –           U+2013  (&#x2013;) –  &ndash; –
 *  Em dash —           U+2014  (&#x2014;) —  &mdash; —
 *  Horizontal bar  ―   U+2015  (&#x2015;) ―  &horbar; ―
 *  minus sign  −       U+2212  (&#x2212;) −  &minus; −
 */
const Dashes      = '[\u2010\u2012-\u2015\u2212-]';
const Dashes_RE   = new RegExp( Dashes, 'g' );

// Alternates that indicate chapter/verse within the source book
const Alts        = [ 'also', 'note',
                      'see',
                      'at', 'cf', 'in', 'of',
                    ];

/* Generate the shared string representation of the Regular Expression to match
 * a valid book name/abbreviation.
 */
const Book_or_str = _generate_Book_or_str();

/* Generate shared regular expressions for matching a full reference set and
 * a second to perform grouping within a single reference.
 */
const Ref_RE      = _generate_Ref_RE();
const Group_RE    = _generate_Group_RE();

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
    verbosity : state.verbosity,
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
    if (typeof(text) !== 'string' || text.length < 4) {
      // Push this non-text/short-text item directly to the normalized set
      _push_item( ref_state, text );
      return;
    }

    // Collapse white-space and identify references
    const norm_text = text.replaceAll(/\s+/g, ' ');
    const matches   = [...norm_text.matchAll( Ref_RE )];

    if (matches.length < 1) {
      if (state.verbosity > 3) {
        console.log('>>> Normalize Xrefs: no match for "%s"', text);
      }

      _push_item( ref_state, text );
      return;
    }

    /************************************************************************
     * Extract references
     *
     */
    ref_state.remain = norm_text;

    matches.forEach( (match, mdex) => {
      const match_text  = match[0];

      if (state.verbosity > 2) {
        console.log('>>> Normalize Xrefs: match %d: input "%s" ...',
                    mdex, match.input);
      }
      if (state.verbosity > 1) {
        console.log('>>> Normalize Xrefs: match %d: match "%s" ...',
                    mdex, match_text);
      }

      // Include any interveening text
      const start = ref_state.remain.indexOf( match_text );
      if (start > 0) {
        const keep  = ref_state.remain.slice(0, start );

        _push_item( ref_state, keep );

        ref_state.remain = ref_state.remain.slice( start );
      }

      // Remove this text from `ref_state.remain`
      ref_state.remain = ref_state.remain.slice( match_text.length );

      _extract_xrefs( ref_state, match_text );
    });

    if (ref_state.remain.length > 0) {
      _push_item( ref_state, ref_state.remain );
    }
  });

  return ref_state.norm;
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Given a match against the full reference regular expression, split into
 *  individual book/chapter strings and extract references from each.
 *
 *  @method _extract_xrefs
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
 *  @param  state.norm      The normalized set {Array};
 *  @param  state.remain    The remaining text to be parsed {String};
 *  @param  state.skip      Characters to skip in the next match {String};
 *  @param  state.last_text The index of the previous text item {Number};
 *  @param  re_match        A string matching the full reference regular
 *                          expression {String};
 *
 *  @return The updated state {Object};
 *  @private
 */
function _extract_xrefs( state, re_match ) {
  const norm_match  = re_match.replaceAll( Dashes_RE, '-' );
  const parts       = norm_match.split(/;\s*/);
  let   remain      = norm_match;
  let   book, ch, vs;

  if (state.verbosity > 2) {
    console.log('>>> Normalize Xrefs: match "%s": parts:',
                re_match, parts);
  }

  parts.forEach( (part,pdex) => {
    const matches   = [...part.matchAll( Group_RE )];

    if (matches.length < 1) {
      // Include any interveening text
      const start = remain.indexOf( part );
      if (start > 0) {
        const keep  = remain.slice(0, start );
        remain = remain.slice( start );

        _push_item( state, keep );
      }

      // Remove this text from `remain`
      remain = remain.slice( part.length );
      return;
    }

    matches.forEach( (match, mdex) => {
      let   text      = match[0];
      const lc_input  = match.input.toLowerCase();
      const groups    = match.groups;

      /*
      console.log('>>>> match %d[ %s : %s ]: text[ %s ], groups: %O',
                  mdex, norm_match, match.input, text, groups);
      // */

      /* First, handle any book name dealing with special cases like:
       *    - 'chapter' | 'ch.?'
       *    - Alternatives
       */
      if (groups.book) {
        const lc_book = groups.book.toLowerCase();

        if (lc_book.startsWith('ch')) {
          // Chapter
          text = lc_input;
          book = state.book;

          /*
          console.log('===== Chapter[ %s ] => text[ %s ], book[ %s ]',
                      groups.book, text, book);
          // */

        } else if (Alts.includes( lc_book )) {
          // Alternative (non-book)
          const alt = groups.book + ' ';  // Include trailing white-space
          text = text.slice( alt.length );

          book = state.book;

        } else {
          // Book : see if it is a valid book name
          const ABBR  = Books.nameToABBR( groups.book );
          if (ABBR) { book = ABBR }
          else      {
            console.log('*** Normalize Xrefs: book[ %s ] NOT recognized',
                        groups.book);

            book = groups.book;
          }
        }
      }

      // Include any interveening text
      const start = remain.indexOf( text );
      if (start > 0) {
        const keep  = remain.slice(0, start );
        remain = remain.slice( start );

        _push_item( state, keep );
      }

      // Remove this text from `remain`
      remain = remain.slice( text.length );

      // Handle updated to chapter and verse
      if (groups.ch)    { ch = groups.ch.replaceAll(/\s+/g,'') }
      if (groups.vs)    { vs = groups.vs.replaceAll(/\s+/g,'') }

      let ref = `${book}.${ch}`;
      if (vs) { ref += `.${vs}` }

      _push_item( state, {xt: { text: text, usfm: ref }} );
    });
  });

  if (remain.length > 0) {
    _push_item( state, remain );
  }

  return state;
}

/**
 *  Add a new item, possibly text, to the normalized set.
 *
 *  @method _push_item
 *  @param  state           The current reference state {Object};
 *  @param  state.norm      The normalized set {Array};
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

/********************************************************************
 * Consolidate regular expression generation {
 *
 */

/**
 *  Generate a regular expression string that may be used to identify valid
 *  books.
 *
 *  @method _generate_Book_or_str
 *
 *  @return The regular expression string {String};
 *  @private
 */
function _generate_Book_or_str() {
  // Fetch all books from all locations (e.g. Old/New Testament)
  const book_map = Books.getBooks( '*' );

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

  const re_str  = `${book_re.join('|')}|ch\.?|chapter`;

  /*
  console.log('>>> _generate_Book_or_str(): "%s"', re_str);
  // */

  return re_str;
}

/**
 *  Generate a full regular expression to identify all cross-reference sets
 *  within raw text.
 *
 *  @method _generate_Ref_RE
 *
 *  @return The full cross-reference regular expression {RegExp};
 *  @private
 */
function _generate_Ref_RE() {
  /* CH     = 1[0-9]{2}|[1-9][0-9]|[1-9](?![0-9])   1## | 1# | 1-9 (![0-9])
   * VS     = 1[0-9]{2}|[1-9][0-9]|[1-9](?![0-9])   1## | 1# | 1-9 (![0-9])
   *
   * VR     = VS(-VS)?(, VS(-VS)?)*
   * CHVS   = CH((:VR)?(; CH:VR)*)
   *
   * BK     = BOOK CHVS
   * ALT    = (also|note|see|at|cf|in|of) CH:VR
   * CHAP   = (ch.?|chapter) CH
   *
   * REF    = BK(; (BK|CHVS))*|ALT|CHAP
   */
  const book    = Book_or_str;
  const ch      = '(1[0-9]{2}|[1-9][0-9]|[1-9])(?![0-9])';  // Psalm 150
  const vs      = '(1[0-9]{2}|[1-9][0-9]|[1-9])(?![0-9])';  // Psalm 119:176
  const vr      = `${vs}(${Dashes} ?${vs})?(, ?${vs}(${Dashes} ?${vs})?)*`
  const chvs    = `${ch}(([.:]${vr})?(; ?${ch}[.:]${vr})*)`;
  const bk      = `(${book})[. ]+${chvs}`;
  const alt     = `(${Alts.join('|')}) ${ch}[.:]${vr}`;
  const ref     = `${bk}(; ?(${bk}|${chvs}))*|${alt}`;

  /*
  console.log('>>> _generate_Ref_RE(): "%s"', ref);
  // */

  return new RegExp( ref, 'ig' );
}

/**
 *  Generate a regular expression to perform grouping from the text of a single
 *  cross-reference string.
 *
 *  @method _generate_Group_RE
 *
 *  The groups will be:
 *    book      The name of the referenced book {String | undefined};
 *    ch        The chapter {String | undefined};
 *    vs        Any verse(es) {String | undefined};
 *
 *  @return The regular express {RegExp};
 *  @private
 */
function _generate_Group_RE() {
  /* CH     = 1[0-9]{2}|[1-9][0-9]|[1-9](?![0-9])   1## | 1# | 1-9 (![0-9])
   * VS     = 1[0-9]{2}|[1-9][0-9]|[1-9](?![0-9])   1## | 1# | 1-9 (![0-9])
   *
   * VR     = VS(-VS)?(, VS(-VS)?)*
   * CHVS   = CH((:VR)?
   *
   * BK     = BOOK CHVS
   * ALT    = (also|note|see|at|cf|in|of) CH:VR
   *
   * REF    = BOOK CHVS|ALT|ch.|chapter
   */
  const alt     = `(${Alts.join('|')})`;
  const book    = `${Book_or_str}|${alt}`;
  const ch      = '(1[0-9]{2}|[1-9][0-9]|[1-9])(?![0-9])';  // Psalm 150
  const vs      = '(1[0-9]{2}|[1-9][0-9]|[1-9])(?![0-9])';  // Psalm 119:176
  const vr      = `${vs}(${Dashes} ?${vs})?(, ?${vs}(${Dashes} ?${vs})?)*`
  const chvs    = `((?<ch>${ch})(([.:](?<vs>${vr})))?)`;
  const ref     = `((?<book>${book})[. ]+)?${chvs}`;

  /*
  console.log('>>> _generate_Group_RE(): "%s"', ref);
  // */

  return new RegExp( ref, 'ig' );
}

/* Consolidate regular expression generation }
 ********************************************************************
 *
 * Private helpers }
 ****************************************************************************/

module.exports  = {
  normalize : normalize_xrefs,
};
