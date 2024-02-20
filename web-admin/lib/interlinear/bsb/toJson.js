/**
 *  Handle conversion of parsed data for the Interlinear version of the Berean
 *  Standard Bible into a JSON form suitable for import into the backend
 *  database.
 *
 *  The generated JSON will have the form:
 *    {
 *      id          : 1588,
 *      abbreviation: 'AMP',
 *      title: 'Amplified Bible',
 *      language: { ... },
 *      publisher_id: 37,
 *      platforms: { ... },
 *      offline: { ... },
 *      metadata_build: 9,
 *      vrs: 'eng',
 *      ...
 *      books: { Map
 *        BOOK: { Map
 *          1:  {
 *            1:  Verse1-interlinear-data,
 *            2:  Verse2-interlinear-data,
 *            ...
 *          },
 *          ...
 *        },
 *        ...
 *      }
 *    }
 *
 *  Each interlinear verse will have the form:
 *      { interlinear   : [
 *          { sort_heb      : Sort order for hebrew {Number};
 *            sort_grk      : Sort order for greek {Number};
 *            sort_bsb      : Sort order for english {Number};
 *            language      : The language of this entry (Hebrew | Greek)
 *                            {String};
 *            wlc           : The WLC / Nestle Base {String};
 *            tranlit       : The transliteration of the source {String};
 *            parsing       : Information about parsing {String};
 *            type_of_speech: Type-of-speech identification {String};
 *            strongs       : The Strongs reference for this entry {Number};
 *            heading       : The section heading {String};
 *            xref          : Any cross references (in 'Book c:v' format)
 *                            {String};
 *            verse_bsb     : The english translation {String};
 *            footnotes     : Any related footnotes {String};
 *            bdb           : Additional information about the source {String};
 *          },
 *          ...
 *        ],
 *
 *        text  : Full english text of this verse {String};
 *      }
 *
 *  The data provided via `parse` should be an array with entries in the form:
 *    { sort_heb      : Sort order for hebrew {Number};
 *      sort_grk      : Sort order for greek {Number};
 *      sort_bsb      : Sort order for english {Number};
 *      language      : The language of this entry (Hebrew | Greek}
 *                      {String};
 *      vs            : The verse number {Number};
 *      wlc           : The WLC / Nestle Base {String};
 *      tranlit       : The transliteration of the source {String};
 *      parsing       : Information about parsing {String};
 *      type_of_speech: Type-of-speech identification {String};
 *      strongs       : The Strongs reference for this entry {Number};
 *      verse         : The full verse identification
 *                      (e.g. 'Genesis 1:1') {String};
 *      heading       : The section heading {String};
 *      xref          : Any cross references (in 'Book c:v' format) {String};
 *      verse_bsb     : The english translation {String};
 *      footnotes     : Any related footnotes {String};
 *      bdb           : Additional information about the source {String};
 *    }
 */
const Fs        = require('fs');
const Readline  = require('readline');
const Books     = require('../../books');
const Refs      = require('../../refs');
const Parse     = require('./parse').parse;
const Version   = require('./version').Version;

// Constants used later
const {
  PATH_CSV,
  PATH_JSON,
} = require('./constants');

/**
 *  Convert data generated via `Bsb.parse()` to JSON format.
 *
 *  @method toJson
 *  @param  [config]                Fetch configuration {Object};
 *  @param  [config.inPath  = null] A specific input CSV path {String};
 *  @param  [config.outPath = null] A specific output JSON path {String};
 *  @param  [config.force = false]  If truthy, fetch even if the output file
 *                                  already exists {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *
 *  @return A promise for results {Promise};
 *          - on success, the path to the processed file, suitable for loading
 *                        into the backend database {String}; {String};
 *          - on failure, an error {Error};
 */
async function toJson( config=null ) {
  config  = Object.assign({
              inPath    : PATH_CSV,
              outPath   : PATH_JSON,
              force     : false,
              verbosity : 0,
            }, config||{} );

  if (! Fs.existsSync( config.inPath ) ) {
    await Parse( {outPath: config.inPath} );
  }

  if (config.force || ! Fs.existsSync( config.outPath ) ) {
    await _csv_to_json( config.inPath, config.outPath );

  } else if (config.verbosity) {
    console.log('=== JSON data already cached');
    console.log('===   Path: %s', config.outPath);
  }

  return config.outPath;
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Convert a CSV file to JSON
 *
 *  @method _csv_to_json
 *  @param  path_csv    The path to the (input) CSV file {String};
 *  @param  path_json   The path to the (output) JSON file {String};
 *
 *  @return A promise for results {Promise};
 *          - on success, true {Boolean};
 *          - on failure, an error {Error};
 *  @private
 */
function _csv_to_json( path_csv, path_json ) {
  const version = { ...Version };
  const keys    = [
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

  // Exclude the handler set
  delete version.handler;

  console.log('>>> Convert CSV to JSON ...');
  return new Promise((resolve, reject) => {
    const inputStream       = Fs.createReadStream(  path_csv );
    const outputFilestream  = Fs.createWriteStream( path_json );
    const rl                = Readline.createInterface({
      input: inputStream,
      crlfDelay: Infinity
    });

    const state = {
      out             : outputFilestream,
      first_ref       : {book:null, chapter:null, verse:null},
      cur_ref         : {book:null, chapter:null, verse:null},
      book_map        : new Map(),
      chap_map        : new Map(),
      verses          : [],
      first_book      : true,
      lines_to_ignore : 1,
      nlines          : 0,
      header          : [],
    };

    /* Begin the output with the base version information plus:
     *      books: {
     *
     *  Once complete, we'll need to close this with:
     *      }
     *    }
     */
    let   jsonStr = JSON.stringify( version, null, 2 )
                      .replace(/\n}$/, ',\n');

    state.out.write( jsonStr );
    state.out.write( '  "books": {\n' );

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
                // Output the current book including any pending chapter
                _outputBook( state );

                state.first_ref = ref;

              } else if (ref.chapter !== state.cur_ref.chapter) {
                /* New chapter
                 *
                 * Store this chapter data and start a new verse set.
                 */
                state.chap_map.set( state.cur_ref.chapter, [...state.verses] );

                // Convert the chapter to JSON and store in the book
                const json  = _mapJson( state.chap_map);

                state.book_map.set( state.cur_ref.chapter, json );
                state.chap_map.clear();
                state.verses.length = 0;

              }

              // Update the current ref
              state.cur_ref = ref;
              continue;

            } break;
          }

          verseObj[ key ] = val;
        }

        state.verses.push( verseObj );
      }
    });

    rl.on('error', (err) => {
      rl.close();
      return reject( err );
    });

    rl.on('close', () => {
      if (state.book_map.size > 0) {
        _outputBook( state );
      }

      state.out.write( '  }\n}\n' );
      state.out.close();

      console.log('>>> Finished parsing the %s lines of csv',
                    state.nlines.toLocaleString());
      console.log('>>>   Output: %s', path_json);

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
 *  Given a book map, output the JSON version of the map.
 *
 *  @method _outputBook
 *  @param  state           The parse state {Object};
 *  @param  state.book_map  The book map (chapters) {Map};
 *  @param  state.chap_map  The chapter map (verse) {Map};
 *  @param  state.cur_ref   The current verse reference {Object};
 *  @param  state.out       The output stream {Stream};
 *
 *  @return void
 *  @private
 */
function _outputBook( state ) {
  const bkJson  = _mapJson( state.book_map );
  if (bkJson != null) {
    const cur_ref = state.cur_ref;
    const fir_ref = state.first_ref;
    console.log('>>>> %s [%s.%s-%s.%s] ...',
                fir_ref.book, fir_ref.chapter, fir_ref.verse,
                cur_ref.chapter, cur_ref.verse);

    // Validate book information
    const book  = Books.getBook( fir_ref.book );
    if (book) {
      if (cur_ref.chapter !== book.verses.length - 1) {
        console.error('*** %s has %d chapters, %d expected',
                      cur_ref.book, cur_ref.chapter, book.verses.length - 1);
      }
      if (cur_ref.verse !== book.verses[ cur_ref.chapter ]) {
        console.error('*** %s last chapter has %d verses, %d expected',
                      cur_ref.book, cur_ref.chapter, book.verses.length - 1);
      }
    }

    // Handle any separator first
    if (state.first_book) {
      state.first_book = false;

    } else {
      state.out.write( ',\n' );

    }

    if (state.chap_map.size > 0) {
      // Include any pending chapter
      const chJson  = _mapJson( state.chap_map);
      if (chJson != null) {
        state.book_map.set( state.cur_ref.chapter, chJson );
      }
    }

    // Convert the book to JSON and output
    const jsonStr = JSON.stringify( bkJson, null, 2 )
                      .replaceAll(/\n/g, '\n    ');

    state.out.write( `    "${state.cur_ref.book}": ${jsonStr}` );
  }

  // Clear the state
  state.book_map.clear();
  state.chap_map.clear();
  state.verses.length = 0;
}

/* Private helpers }
 ****************************************************************************/

module.exports = {
  toJson,
};
