/**
 *  Convert data for the Interlinear version of the Berean Standard Bible
 *  extracted via `Bsb.extract.version()` into a normalized, database ready
 *  JSON format.
 *
 */
const Fs        = require('fs');
const Path      = require('path');
const Readline  = require('readline');
const FsUtils   = require('../../fs_utils');
const Books     = require('../../books');
const Refs      = require('../../refs');

// Constants used later
const {
  PATH_CACHE,
  PATH_CSV,
} = require('./constants');

const Extract     = require('./extract');
const { Version } = require('./version');

/****************************************************************************
 * Public methods {
 *
 */

/**
 *  Convert data for the Interlinear version of the Berean Standard Bible
 *  extracted via `Bsb.extract.version()` into a normalized, database ready
 *  JSON format.
 *
 *  @method prepare_version
 *  @param  [config]                  Fetch configuration {Object};
 *  @param  [config.vers = 'BSB-IL']  The target version {String};
 *  @param  [config.version = null]   If provided, pre-fetched information
 *                                    about the target version
 *                                    (Bsb.fetch.find()). If this is provided,
 *                                    `config.vers` may be omitted {Version};
 *  @param  [config.inPath  = null] A specific input CSV path {String};
 *  @param  [config.outPath = null] A specific output path {String};
 *  @param  [config.force = false]  If truthy, fetch even if the output file
 *                                  already exists {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *  @param  [config.returnVersion = false]
 *                                  If truthy, return the extracted version
 *                                  data {Boolean};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, the path to the location holding the generated JSON
 *                        data or the top-level version data
 *                        {String | Version};
 *          - on failure, rejects  with an error {Error};
 */
async function prepare_version( config=null ) {
  config  = Object.assign({
              inPath        : PATH_CSV,
              force         : false,
              verbosity     : 0,
              returnVersion : false,
            }, config||{} );

  let version = config.version;
  if (version == null) {
    /* Ensure version data has been extracted and retrieve the top-level
     * version information.
     */
    const configExtract = {
      vers          : Version.abbreviation,
      outPath       : config.inPath,
      verbosity     : config.verbosity,
      returnVersion : true,
    };

    version = await Extract.version( configExtract );
    if (version == null) {
      throw new Error(`Cannot find/extract version ${config.vers}`);
    }

    config.version = version;
  }

  // assert( config.vers == null || config.vers === Version.abbreviation );

  // Update `config` using the official abbreviation
  const ABBR = version.abbreviation;
  if (config.outPath == null) {
    config.outPath = Path.join( PATH_CACHE, ABBR );
  }

  // Prepare the cache location before checking for existence
  await FsUtils.make_dir( config.outPath );

  const versPath  = Path.join( config.outPath, 'version.json' );
  const isCached  = await FsUtils.exists( versPath );

  if (config.force || ! isCached) {
    /* Ensure version.type reflects this source, but excludes `_cache` and
     * `_handler`
     */
    const json  = { ...version, type:'interlinear' };
    delete json._cache;
    delete json._handler;

    if (config.verbosity) {
      console.log('>>> %s : cache version data ...', ABBR);
    }

    Fs.writeFileSync( versPath, JSON.stringify( json, null, 2 )+'\n' );

    // Convert CSV data to JSON
    await _csv_to_json( config );

  } else if (config.verbosity) {
      console.log('>>> %s : version data exists', ABBR);
  }

  if (config.returnVersion) {
    // Pass along cache location information
    version._cache = Object.assign( { prepare: config.outPath },
                                    version._cache || {} );
  }

  return (config.returnVersion ? version : config.outPath);
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Convert a CSV file to JSON
 *
 *  @method _csv_to_json
 *  @param  config                  Fetch configuration {Object};
 *  @param  config.version          Information about the configured version
 *                                  (Bsb.fetch.find()) {Version};
 *  @param  config.inPath           The path to the input CSV {String};
 *  @param  config.outPath          The path to the output directory {String};
 *  @param  [config.force = false]  If truthy, fetch even if the output file
 *                                  already exists {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *
 *  @return A promise for results {Promise};
 *          - on success, true {Boolean};
 *          - on failure, an error {Error};
 *  @private
 */
function _csv_to_json( config ) {
  const path_csv  = config.inPath;
  const path_out  = config.outPath;
  const ABBR      = config.version.abbreviation;
  const keys      = [
    /* Keys with '!' prefix will be excluded
     * Key  with '#' prefix will converted to an integer
     * Key  with ':' prefix identifies the full verse reference
     *
     * tos: Type-of-speech
     * bdb: Notes from the Brown-Driver-Briggs lexicon, a well-respected Hebrew
     *      and English lexicon
     *        https://www.blueletterbible.org/resources/lexical/bdb.cfm
     * wlc: Text from the Westminster Leningrad Codex is the oldest complete
     *      manuscript of the Hebrew Bible in Hebrew, using the Masoretic Text
     *      and Tiberian vocalization.  According to its colophon, it was made
     *      in Cairo in AD 1008 (or possibly 1009).[1]
     *        https://en.wikipedia.org/wiki/Leningrad_Codex
     */
    '!sort_heb',  '!sort_grk',  '!sort_bsb',
    'language',   '!vs',        'wlc',        '!<=>',
    'translit',   'tos',        'tos_label',  '#strongs',   ':verse',
    'heading',    'xref',       'text',       'footnotes',  'bdb',

  ];

  return new Promise((resolve, reject) => {
    const inputStream       = Fs.createReadStream(  path_csv );
    const rl                = Readline.createInterface({
      input: inputStream,
      crlfDelay: Infinity
    });

    const state = {
      ABBR            : ABBR,
      verbosity       : config.verbosity,
      force           : config.force,

      out_dir         : path_out,
      first_ref       : {book:null, chapter:null, verse:null},
      cur_ref         : {book:null, chapter:null, verse:null},
      book_map        : new Map(),
      chap_map        : new Map(),
      verse_data      : [],
      first_book      : true,
      lines_to_ignore : 1,
      nlines          : 0,
      header          : [],
    };

    rl.on('line', (line) => {
      state.nlines++;

      if (state.nlines <= state.lines_to_ignore) {
        return;
      }

      if (state.header.length === 0) {
        state.header = _csv_line_to_array( line );

      } else {
        const line_array  = _csv_line_to_array( line );
        const verseObj    = {};
        let   nkeys       = 0;
        
        /* Keys with '!' prefix will be excluded
         * Key  with '#' prefix will converted to an integer
         * Key  with ':' prefix identifies the full verse reference
         */
        for (let idex in state.header) {
          let key = keys[ idex ] || state.header[ idex ];
          let val = line_array[ idex ];

          if (val == null || val === '') { continue }

          switch( key[0] ) {
            case '!':
              // Skip this field
              continue;

            case '#':
              // Convert the value to an integer
              val = parseInt( val );
              key = key.slice(1);
              break;

            case ':': {
              /* This is the start of a new verse and possibly a new
               * chapter/book.
               *
               * Parse this to {book, chapter, verse}
               */
              const ref = _parse_ref( val );
              key = key.slice(1);

              //console.log('ref[ %s ], cur:', val, state.cur_ref);

              if (ref == null) {
                console.error('*** Cannot resolve reference[ %s ]', val);
                return;
              }

              if (ref.book !== state.cur_ref.book) {
                // New book: finalize any current book
                _finishBook( state );

                state.first_ref = ref;

              } else if (ref.chapter !== state.cur_ref.chapter) {
                // New chapter: finalize any current chapter
                _finishChapter( state );

              } else if (ref.verse !== state.cur_ref.verse) {
                // New verse: finalize any current verse
                _finishVerse( state );
              }

              // Update the current ref
              state.cur_ref = ref;
              continue;

            } break;
          }

          nkeys++;
          verseObj[ key ] = val;
        }

        if (nkeys > 0) {
          state.verse_data.push( verseObj );
        }
      }
    });

    rl.on('error', (err) => {
      rl.close();
      return reject( err );
    });

    rl.on('close', () => {
      if (state.book_map.size > 0) {
        _finishBook( state );
      }

      if (config.verbosity) {
        console.log('>>> Prepare %s: Finished parsing the %s lines of csv',
                      ABBR, state.nlines.toLocaleString());
      }

      return resolve( true );
    });
  });
}

/**
 * Convert a CSV line ('asd',asdf,'a sdf',...) to an array, (['asd', 'asdf', 'a
 * sdf']). Useful to later zipping to the header line to make a dictionary.
 *
 * @method  _csv_line_to_array
 * @param   line  The string that contains the CSV line {String};
 *
 * @return  An array of records {Array};
 *  @private
 */
function _csv_line_to_array(line) {

  // Process character by character
  const res             = []
  let   value           = '';
  let   inside_a_value  = false;

  for (ch of line) {
    if (ch === '\"') {

      inside_a_value = !inside_a_value;

      // We are at the end of an entry, let's push it on our array
      //if ( value !== "" ) {
      //  res.push( value )
      //  value = ""
      //}

    } else if ( ch === ',' ) { 

      if ( !inside_a_value ) {
        res.push( value )
        value = ""

      } else {
        // Since value has values, the comma is part of the actual text.
        value += ch;
      }

    } else {
      //Nothing special, just add the character to our temp value
      value += ch;
    }
  }

  res.push( value )

  return res
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
 *  @method _mapJson
 *  @param  src   The source {Map};
 *
 *  @return The JSON version of `src` or undefined if empty {Object};
 *  @private
 */
function _mapJson( src ) {
  if (src.size < 1) { return }

  const json  = {};
  src.forEach( (val, key) => {
    json[ key ] = val;
  });

  return json;
}

/**
 *  Given verse data, finilize a verse adding it to the current chapter.
 *
 *  @method _finishVerse
 *  @param  state             The parse state {Object};
 *  @param  state.chap_map    The chapter map (verse) {Map};
 *  @param  state.cur_ref     The current verse reference {Object};
 *  @param  state.verse_data  Accumulating verse data {Array};
 *
 *  @return Updated state {Object};
 *  @private
 */
function _finishVerse( state ) {
  if (state.verse_data.length > 0) {
    // Include any final verse data of this chapter
    state.chap_map.set( state.cur_ref.verse, [...state.verse_data] );

    // Clear the verse state
    state.verse_data.length = 0;
  }

  return state;
}

/**
 *  Given a chapter map, generate a JSON representation of the chapter.
 *
 *  @method _finishChapter
 *  @param  state             The parse state {Object};
 *  @param  state.book_map    The book map (chapters) {Map};
 *  @param  state.chap_map    The chapter map (verse) {Map};
 *  @param  state.cur_ref     The current verse reference {Object};
 *  @param  state.verse_data  Accumulating verse data {Array};
 *
 *  @return Updated state {Object};
 *  @private
 */
function _finishChapter( state ) {
  if (state.verse_data.length > 0) {
    // Include any final verse data of this chapter
    _finishVerse( state );
  }

  /* Convert the chapter to JSON, generate the full chapter text, and store in
   * the book.
   *
   * When generating the full text, we will also clean it up a bit:
   *  - exclude some text (' - ', ' . . . ');
   *  - trim all white-space from the start and end of each text item;
   *  - replace white-space that preceeds characters [,;:.!”];
   *  - replace white-space that follows  characters [“];
   */
  const chJson    = _mapJson( state.chap_map );
  const fullText  = {};
  // The set of text entries we will skip
  const exclude   = [ null, undefined, ' - ', ' . . . ' ];

  Object.entries(chJson).forEach( ([ref,verse]) => {
    const text  = verse
                    .map( entry => {
                      if (exclude.includes( entry.text )) { return }

                      return entry.text
                                .trim()
                                .replaceAll(/ ([,;:.!”])/g, '$1')
                                .replaceAll(/([“]) /g, '$1');
                    })
                    .filter( entry => entry && entry.length > 0 );

    fullText[ ref ] = text.join(' ');
  });

  const json      = {
    verse_count : state.chap_map.size,
    label       : state.cur_ref.chapter,
    verses      : chJson,
    fullText    : fullText,
  };

  // Store this chapter
  state.book_map.set( state.cur_ref.chapter, json );

  // Clear the chapter state
  state.chap_map.clear();
  state.verse_data.length = 0;

  return state;
}

/**
 *  Given a book map, output the JSON version of the map.
 *
 *  @method _finishBook
 *  @param  state           The parse state {Object};
 *  @param  state.out_dir   The output directory path {String};
 *  @param  state.book_map  The book map (chapters) {Map};
 *  @param  state.chap_map  The chapter map (verse) {Map};
 *  @param  state.cur_ref   The current verse reference {Object};
 *  @param  state.force     If truthy, overwrite event if the output file
 *                          already exists {Boolean};
 *  @param  state.verbosity The verbosity level {Number};
 *  @param  state.ABBR      The abbreviation of the current version {String};
 *
 *  @return Updated state {Object};
 *  @private
 */
function _finishBook( state ) {
  // We have existing book data that needs to be complete
  const ABBR    = state.ABBR;
  const cur_ref = state.cur_ref;
  const fir_ref = state.first_ref;

  if (state.chap_map.size > 0) {
    // Finalize any pending chapter
    _finishChapter( state );
  }

  const path_json = Path.join( state.out_dir, `${state.cur_ref.book}.json` );
  const isCached  = Fs.existsSync( path_json );

  if (state.force || ! isCached) {
    // Cache the data for this book
    const bkJson  = _mapJson( state.book_map );

    if (bkJson != null) {
      // Validate book information
      const book  = Books.getBook( fir_ref.book );

      // Perform validation IFF verbosity > 1
      if (state.verbosity > 1 && book) {
        if (cur_ref.chapter !== book.verses.length - 1) {
          console.error('*** %s has %d chapters, %d expected',
                        cur_ref.book, cur_ref.chapter, book.verses.length - 1);
        }
        if (cur_ref.verse !== book.verses[ cur_ref.chapter ]) {
          console.error('*** %s last chapter has %d verses, %d expected',
                        cur_ref.book, cur_ref.chapter, book.verses.length - 1);
        }
      }

      // Convert the book to JSON and output
      const json  = {
        metadata: [],
        chapters: bkJson,
      };

      console.log('>>>> %s : %s [%s.%s-%s.%s] ...',
                  ABBR, fir_ref.book, fir_ref.chapter, fir_ref.verse,
                  cur_ref.chapter, cur_ref.verse);

      Fs.writeFileSync( path_json, JSON.stringify( json, null, 2 )+'\n' );
    }

  } else if (state.verbosity) {
    console.log('>>> %s : %s already cached', ABBR, fir_ref.book);

  }

  // Clear the state
  state.book_map.clear();
  state.chap_map.clear();
  state.verse_data.length = 0;

  return state;
}

/* Private helpers }
 ****************************************************************************/

module.exports = {
  version : prepare_version,
};
