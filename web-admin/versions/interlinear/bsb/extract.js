/**
 *  Extract data for the Interlinear version of the Berean Standard Bible
 *  fetched via `Bsb.fetch.version()` into a prepared JSON, one per book.
 *
 *  Note: This extractor performs both the extract and prepare steps, meaning
 *        that `Bsb.prepare.version()` is simply an alias for
 *        `Bsb.extract.version()`.
 *
 *  The source XLSX has 5 worksheets with the first 4 empty.
 *
 *  The 5th worksheet contains the data.
 *    Column 0 seems to always be empty so the actual column count is 1
 *    less.
 *
 *    Row 1: A comment about the source
 *    Row 2: The column headers / field identifiers
 *      1   : Heb Sort                        {Number | Empty};
 *      2   : Grk Sort                        {Number | Empty};
 *      3   : BSB Sort                        {Number};
 *      4   : Language                        {String};
 *      5   : Vs                              {Number};
 *      6   : WLC / Nestle Base ...           {String};
 *      7   : ⇔                               {Empty};
 *      8   : Translit                        {String};
 *      9   : Parsing                         {String};
 *      10  : <No label : Describes Parsing>  {String};
 *      11  : Strongs                         {Number};
 *      12  : Verse                           {String | Empty};
 *      13  : Heading                         {String | Empty};
 *      14  : Cross Reference                 {String | Empty};
 *      15  : BSB Version                     {String};
 *      16  : Footnotes                       {String | Empty};
 *      17..: BDB / Thayers                   {String};
 *
 *    Columns 1-3 : Heb/Grk/BSB Sort
 *      Labels suggest they are language-specific sort orders but their values
 *      seem to be some sort of index into the sentence...
 *
 *    Columns 4   : Language (language)
 *      The language this entry references (Hebrew | Greek).
 *
 *    Column 5    : Vs
 *      Seems to be a total verse count from the beginning indicating a
 *      specific Book/Chapter/Verse. This has the same values for all entries
 *      within a single verse.
 *
 *    Column 6    : WLC / Nestle Base (wlc)
 *      Text from the Westminster Leningrad Codex is the oldest complete
 *      manuscript of the Hebrew Bible in Hebrew, using the Masoretic Text and
 *      Tiberian vocalization.  According to its colophon, it was made in Cairo
 *      in AD 1008 (or possibly 1009).[1]
 *        https://en.wikipedia.org/wiki/Leningrad_Codex
 *
 *    Column 8    : Translit (translit)
 *      A transliteration of the WLC text.
 *
 *    Columns 9-10: Parsing (tos / tos_label)
 *      Identifies the type-of-speech (Columnn 9) with descrpition (Column 10),
 *      for example:
 *
 *       9              : 10
 *      ----------------:------------------------------------------------------
 *      Prep-b | N-fs   : Preposition-b | Noun - feminine singular
 *      N-mp            : Noun - masculine plural
 *      DiObjM          : Direct object marker
 *      V-Qal-Perf-3ms  : Verb - Qal - Perfect - third person masculine singulr
 *      Art | N-mp      : Article | Noun - masculine singular
 *
 *    Column 11   : Strongs (strongs)
 *      The strongs reference number. This is in relation to `Language` and is
 *      typically represented with the first letter of the language followed by
 *      this reference number. For example, with a 'Greek' entry and 'Strongs'
 *      value of '123', this would be represnted as 'g123'.
 *
 *    Column 12   : Verse
 *      The textual verse reference in the form `Book chapter:verse`.
 *      If this column is empty, the entry is related to the last verse where
 *      this column was NOT empty. All items with no entry here will share
 *      the same value for Column 5 (Vs).
 *        e.g. 'Genesis 1:1'
 *
 *    Column 13   : Heading (heading)
 *      Seems to be a section heading of some sort that only appears in some
 *      entries.
 *
 *    Column 14   : Cross Reference (xref)
 *      Any cross reference to other verse(s).
 *        e.g. '(John 1:1-5; Hebrews 11:1-3)'
 *
 *    Column 15   : BSB Version (text)
 *      The english translation for the Berean Standard Bible.
 *      There are several special cases for this column:
 *        '-'     : no translation?
 *        '- ...' : no translation + white-space-delimited punctuation?
 *
 *    Column 16   : Footnotes (footnotes)
 *      Footnote text for for the Berean Standard Bible.
 *      This MAY have minimal HTML markup (e.g. <i>...</i>).
 *
 *    Column 17   : BDB / Thayers (bdb_notes)
 *      This can overflow multiple columns but is fully contained in Column 17.
 *      When there is an overflow, there will be one final, empty column at the
 *      end of the overflow.
 *      This MAY have minimal HTML markup (e.g. <BR>).
 *
 *      These are notes from the Brown-Driver-Briggs lexicon, a well-respected
 *      Hebrew and English lexicon
 *        https://www.blueletterbible.org/resources/lexical/bdb.cfm
 *
 *
 */
const Path              = require('path');
const Fs                = require('fs');
const Readline          = require('readline');
const XlsxStreamReader  = require('xlsx-stream-reader');

const FsUtils = require('../../../lib/fs_utils');
const Books   = require('../../../lib/books');
const Refs    = require('../../../lib/refs');

// Constants used later
const {
  PATH_CACHE,
  PATH_XLSX,
} = require('./constants');

const Fetch       = require('./fetch');
const { Version } = require('./version');

/****************************************************************************
 * Public methods {
 *
 */

/**
 *  Extract the data for the named version.
 *
 *  @method extract_version
 *  @param  [config]                  Fetch configuration {Object};
 *  @param  [config.vers = 'BSB-IL']  The target version {String};
 *  @param  [config.version = null]   If provided, pre-fetched information
 *                                    about the target version
 *                                    (Bsb.fetch.find()). If this is provided,
 *                                    `config.vers` may be omitted {Version};
 *  @param  [config.inPath  = null] A specific input XLSX path {String};
 *  @param  [config.outPath = null] A specific output path {String};
 *  @param  [config.force = false]  If truthy, fetch even if the output file
 *                                  already exists {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *  @param  [config.returnVersion = false]
 *                                  If truthy, return the extracted version
 *                                  data {Boolean};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, the path to the location holding the extracted data
 *                        OR the top-level version data {String | Version};
 *          - on failure, rejects  with an error {Error};
 */
async function extract_version( config=null ) {
  const version   = {...Version};
  const ABBR      = version.abbreviation;

  config  = Object.assign({
              inPath        : PATH_XLSX,
              outPath       : Path.join( PATH_CACHE, ABBR ),
              force         : false,
              verbosity     : 0,
              returnVersion : false,
            }, config||{} );

  // assert( config.vers == null || config.vers === Version.abbreviation );
  const configFetch = { version, verbosity: config.verbosity };
  const dataPath    = await Fetch.version( configFetch );

  if (config.verbosity) {
    console.log('>>> Extract %s: begin extraction from %s ...',
                version.abbreviation, dataPath);
  }

  // Prepare the cache location to receive generated data
  await FsUtils.make_dir( config.outPath );

  /*******************************************************************
   * :XXX: Since we're using 'version.json' as an indicator of
   *       completion, postpone it's creation to the end of
   *       processing.
   */
  const versPath  = Path.join( config.outPath, 'version.json' );
  const isCached  = await FsUtils.exists( versPath );

  if (config.force || ! isCached) {
    // Process this XLSX file
    await _process_xlsx( config );

    /* Ensure version.type reflects this source, but excludes the "private"
     * variables (_handler, _cache).
     */
    const json  = { ...version };
    delete json._handler;
    delete json._cache;

    if (config.verbosity) {
      console.log('>>> Extract %s: cache version data ...', ABBR);
    }

    Fs.writeFileSync( versPath, JSON.stringify( json, null, 2 )+'\n' );

    if (config.verbosity) {
      console.log('>>> Extract %s: complete', ABBR);
    }

  } else if (config.verbosity) {
    console.log('>>> Extract %s: version data exists', ABBR);

 }

  if (config.returnVersion) {
    // Pass along cache location information
    version._cache = Object.assign( { extract: config.outPath },
                                    version._cache || {} );
  }

  return (config.returnVersion ? version : config.outPath);
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Use the XLSX Stream reader to convert XLSX to JSON, with one JSON object
 *  per verse, containing an array of items.
 *
 *  @method _process_xlsx
 *  @param  config                  Fetch configuration {Object};
 *  @param  config.version          If provided, pre-fetched information
 *                                  about the target version
 *                                  (Bsb.fetch.find()). If this is provided,
 *                                  `config.vers` may be omitted {Version};
 *  @param  config.inPath           The path to the input XLSX {String};
 *  @param  config.outPath          The path to the output directory {String};
 *  @param  [config.force = false]  If truthy, fetch even if the output file
 *                                  already exists {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *
 *  @return A promise for results {Promise};
 *          - on success, true {Boolean};
 *          - on failure, and error {Error};
 *  @private
 */
function _process_xlsx( config ) {
  return new Promise((resolve, reject) => {
    const path_xlsx = config.inPath;
    const ABBR      = config.version.abbreviation;
    const inStream  = Fs.createReadStream(  path_xlsx );
    const reader    = new XlsxStreamReader();
    let   wsCount   = 0;  // Number of worksheets
    let   rowCount  = 0;  // Total number of rows across all worksheets
    const state     = {
      out_dir   : config.outPath,
      force     : config.force,
      verbosity : config.verbosity,
      ABBR      : ABBR,

      ws_id     : null,       // Id of the current worksheet;
      cur_verse : 0,          // Current absolute verse number;
      cur_ref   : null,       // Current verse reference
      book_map  : new Map(),  // Current book map (chapters/verses)
      verse_data: [],         // The accumulating verse data
    };

    // Setup event handlers for the XlsxStreamReader
    reader.on('error', (err) => {
      console.error('*** Extract %s: XlsxStream error:', ABBR, err);

      // Process any remaining data before finalizing
      try {
        _finish_book( state );

      } catch(ex) {
        console.error('*** Extract %s: Cannot finalize book data (error):',
                      ABBR, ex);
      }

      reject( err );
    });

    reader.on('end', () => {
      // Process any remaining data before finalizing
      try {
        _finish_book( state );

      } catch(ex) {
        console.error('*** Extract %s: Cannot finalize book data (end):',
                      ABBR, ex);

        return reject( ex );
      }

      if (config.verbosity) {
        console.log('>>> Extract %s: XLSX: complete }', ABBR);
      }

      return resolve( true );
    });

    reader.on('worksheet', (wsReader) => {
      wsCount++;

      state.ws_id = wsReader.id;

      if (state.verbosity > 1) {
        console.log('>>> Extract %s: Worksheet %s: begin { ...',
                    ABBR, state.ws_id);
      }

      // Set up event handlers for this worksheet reader
      wsReader.on('row', (row) => {
        rowCount++;

        _process_row( row, state );
      });

      if (state.verbosity > 1) {
        wsReader.on('end', () => {
          console.log('>>> Extract %s: Worksheet %s: complete }',
                    ABBR, state.ws_id);
        });
      }

      // Initiate processing now that handlers are attached
      wsReader.process();
    });

    // Begin processing by piping our inStream to the reader
    if (config.verbosity) {
      console.log('>>> Extract %s: XLSX: begin { ...', ABBR);
    }

    inStream.pipe( reader );
  });
}

/**
 *  Process a single XLSX row, updating the current verse and possibly the
 *  `book_map`.
 *
 *  @method _process_row
 *  @param  row               The XLSX row {Object};
 *  @param  state             The parse state {Object};
 *  @param  state.out_dir     The output directory path {String};
 *  @param  state.ws_id       Id of the current worksheet {Number};
 *  @param  state.cur_verse   The current verse (absolute) {Number};
 *  @param  state.cur_ref     The reference of the current verse {Ref};
 *  @param  state.book_map    The book map (chapters) {Map};
 *  @param  state.verse_data  The accumulating data for the current verse
 *                            {Array};
 *  @param  state.force       If truthy, overwrite event if the output file
 *                            already exists {Boolean};
 *  @param  state.verbosity   The verbosity level {Number};
 *  @param  state.ABBR        The abbreviation of the current version {String};
 *
 *  @return Updated state {Object};
 *  @private
 */
function _process_row( row, state ) {
  /*
  const col_cnt = row.values.length - 1;
  // */
  const ABBR    = state.ABBR;
  const row_num = row.attributes.r;
  const values  = row.values;
  const [
    _col0,
    heb_sort,   grk_sort, bsb_sort, language,         // 1-4
    abs_vs,                                           // 5
    wlc,        _col7,    translit, tos,  tos_label,  // 6-10
    strongs,    verse,    heading,  xref, text,       // 11-15
    footnotes,  bdb,                                  // 16-17
  ] = values;

  if (state.verbosity > 2) {
    console.log('>>> Extract %s: Row %s, %d columns ...',
                ABBR, row_num, values.length);
  }

  if (typeof(abs_vs) !== 'number') {
    // This is NOT verse-related data
    return state;
  }
  if (abs_vs !== state.cur_verse) {
    // This is a new verse and SHOULD have a verse reference
    const ref = _parse_ref( verse );
    if (ref != null) {
      // Moving to a new verse
      _finish_verse( state );

      if (state.cur_ref && state.cur_ref.book !== ref.book) {
        // Moving to a new book
        _finish_book( state );
      }

      if (state.verbosity > 1) {
        console.log('>>> Extract %s: Verse %s.%s.%s:%s begin { ...',
                    ABBR, ref.book, ref.chapter, ref.verse, abs_vs);
      }

      state.cur_ref   = {...ref};
      state.cur_verse = abs_vs;

    } else {
      console.error('*** Extract %s: Row %s has an unparsable verse [ %s ]',
                    ABBR, row_num, verse);
    }
  }

  const entry = {
    language,
    abs_vs,
    wlc,
    translit,
    tos,
    tos_label,
    strongs,
    heading,
    xref,
    text,
    footnotes,
    bdb,
  };

  state.verse_data.push( entry );

  return state;
}

/**
 *  Finish the current verse, adding it to the book map and clearing existing
 *  verse data.
 *
 *  @method _finish_verse
 *  @param  state             The parse state {Object};
 *  @param  state.out_dir     The output directory path {String};
 *  @param  state.ws_id       Id of the current worksheet {Number};
 *  @param  state.cur_verse   The current verse (absolute) {Number};
 *  @param  state.cur_ref     The reference of the current verse {Ref};
 *  @param  state.book_map    The book map (chapters) {Map};
 *  @param  state.verse_data  The accumulating data for the current verse
 *                            {Array};
 *  @param  state.force       If truthy, overwrite event if the output file
 *                            already exists {Boolean};
 *  @param  state.verbosity   The verbosity level {Number};
 *  @param  state.ABBR        The abbreviation of the current version {String};
 *
 *  @return Updated state {Object};
 *  @private
 */
function _finish_verse( state ) {
  if (state.cur_ref == null)  { return state }

  const ABBR      = state.ABBR;
  const ref       = state.cur_ref;
  const key       = Refs.sortable( ref.book, ref.chapter, ref.verse );

  /* Generate full text from all text data, clean the text up a bit as we go:
   *  - for each text item:
   *    - exclude any '. .( .)*' prefix, ' . .( .)*' suffix, and ' -' suffix;
   *    - trim all white-space from the start and end;
   */
  const text_ar = state.verse_data.map( entry => {
    if (entry == null || entry.text == null)  { return }

    let text  = String( entry.text );
    if (text[0] === '-')  {
      // Remove the special '-' prefix
      text = text.slice(1).trim();
    }

    // Remove any '. .( .)*' prefix or ' . .( .)*' | ' -' suffix.
    text = text.replace(/^\. \.( \.)*/, '')
               .replace(/ \. \.( \.)*$/, '')
               .replace(/ -$/, '')
               .trim();

    if (text.length < 1)  {
      // Exclude empty text
      return;
    }

    return text;
  });

  /*
  console.log('%s: text_ar:', key, text_ar);
  // */

  /* Finally, combine all portions and perform some final cleanup:
   *  - replace white-space that preceeds characters [,;:.?!”’—)}\]];
   *  - replace white-space that follows  characters [“‘—({\[];
   *
   *  For Unicode punctuation (such as curly quotes, em-dashes, etc), you can
   *  easily match on specific block ranges. The General Punctuation block is
   *  \u2000-\u206F, and the Supplemental Punctuation block is \u2E00-\u2E7F.
   *
   *  Two additional replacements to handle cases that seem to occur between
   *  chapters, e.g.
   *    EXO.020.026: And you must not go up to My altar on steps, lest your
   *                 nakedness be exposed on it.’ [’’]
   *                    v                        ^^^^^
   *    EXO.021.001: [“] These are the ordinances that you are to set before
   *                 them:
   *
   *    EXO.021.036: But if it was known that the ox had a habit of goring,
   *                 yet its owner failed to restrain it, he shall pay full
   *                 compensation, ox for ox, and the dead [animal] will be
   *                 his. [’’]
   *                    v^^^^^
   *    EXO.022.001: [“] If a man steals an ox or a sheep and slaughters or
   *                 sells it, he must repay five oxen for an ox and four
   *                 sheep for a sheep.
   */
  const text  = text_ar.filter( txt => (txt != null) )
                  .join(' ')
                  .replaceAll(/ +([,;:.?!”’—)}\]])/g, '$1')
                  .replaceAll(/([“‘—({\[]) +/g, '$1')
                  .trim()
                  .replace(/^\[“\] /, '“')
                  .replace(/ \[’’\]$/, '');

  /*
  console.log('%s:', key, text);
  // */

  const verse = {
    markup: [ ...state.verse_data ],
    text  : text,
  };

  if (state.verbosity > 1) {
    console.log('>>> Extract %s: Verse %s.%s.%s:%s complete }',
                ABBR, ref.book, ref.chapter, ref.verse, state.cur_verse);
  }

  state.book_map.set( key, verse );
  state.verse_data.length = 0;

  return state;
}

/**
 *  Given a book map, output the JSON version of the map.
 *
 *  @method _finish_book
 *  @param  state             The parse state {Object};
 *  @param  state.out_dir     The output directory path {String};
 *  @param  state.ws_id       Id of the current worksheet {Number};
 *  @param  state.cur_verse   The current verse (absolute) {Number};
 *  @param  state.cur_ref     The reference of the current verse {Ref};
 *  @param  state.book_map    The book map (chapters) {Map};
 *  @param  state.verse_data  The accumulating data for the current verse
 *                            {Array};
 *  @param  state.force       If truthy, overwrite event if the output file
 *                            already exists {Boolean};
 *  @param  state.verbosity   The verbosity level {Number};
 *  @param  state.ABBR        The abbreviation of the current version {String};
 *
 *  @return Updated state {Object};
 *  @private
 */
function _finish_book( state ) {
  if (state.book_map == null || state.book_map.size < 1) { return }

  // We have existing book data that needs to be complete
  const ABBR    = state.ABBR;
  const cur_ref = state.cur_ref;

  if (state.verse_data.length > 0) {
    // Finalize any pending verse
    _finish_verse( state );
  }

  const path_json = Path.join( state.out_dir, `${state.cur_ref.book}.json` );
  const isCached  = Fs.existsSync( path_json );

  if (state.force || ! isCached) {
    // Cache the data for this book
    const bkJson  = _map_to_json( state.book_map );

    if (bkJson != null) {
      // Validate book information
      const book  = Books.getBook( cur_ref.book );

      // Perform validation IFF verbosity > 1
      if (state.verbosity > 1 && book) {
        if (cur_ref.chapter !== book.verses.length - 1) {
          console.error('*** Extract %s: %s has %d chapters, %d expected',
                        ABBR, cur_ref.book, cur_ref.chapter,
                        book.verses.length - 1);
        }

        // :TODO: Iterate over verses and validate their lengths
      }

      // Output the book JSON
      console.log('>>> Extract %s: %s ...', ABBR, cur_ref.book);

      try {
        Fs.writeFileSync( path_json, JSON.stringify( bkJson, null, 2 )+'\n' );

      } catch(ex) {
        console.error('*** Extract %s: %s : write failure:',
                        ABBR, cur_ref.book, ex);
      }

    } else {
      console.warn('=== Extract %s: %s EMPTY book',
                        ABBR, cur_ref.book);
    }

  } else if (state.verbosity) {
    console.log('>>> %s : %s already cached', ABBR, cur_ref.book);

  }

  // Clear the state
  state.book_map.clear();
  state.verse_data.length = 0;

  return state;
}

/**
 *  Convert a BSB verse reference (e.g. Genesis 1:1) to a sortable reference
 *  (e.g. GEN.001.001).
 *
 *  @method _parse_ref
 *  @param  ref     The source reference {String};
 *
 *  @return Reference information {Object};
 *            { book, chapter, verse, ref: sortableRef }
 *  @private
 */
function _parse_ref( ref ) {
  if (ref == null)  { return }

  const match = ref.match(/^(.[^0-9]+) ([0-9]+):([0-9]+)$/);
  if (match == null)  { return }

  let [ _full, book, chap, vers ] = match;
  const res = {
    book    : Books.nameToABBR( book ),
    chapter : parseInt( chap ),
    verse   : parseInt( vers ),
    ref     : null,
  };

  if (res.book == null) { return }

  res.ref = Refs.sortable( res.book, res.chapter, res.verse );

  return res;
}

/**
 *  Convert a map to JSON.
 *
 *  @method _map_to_json
 *  @param  src   The source {Map};
 *
 *  @return The JSON version of `src` or undefined if empty {Object};
 *  @private
 */
function _map_to_json( src ) {
  if (src.size < 1) { return }

  const json  = {};
  src.forEach( (val, key) => {
    json[ key ] = val;
  });

  return json;
}

/* Private helpers }
 ****************************************************************************/

module.exports = {
  version : extract_version,
};
