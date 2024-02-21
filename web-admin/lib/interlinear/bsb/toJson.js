/**
 *  Handle conversion of parsed data for the Interlinear version of the Berean
 *  Standard Bible into a JSON form suitable for import into the backend
 *  database.
 *
 *  The data provided via `parse` should be an array with entries in the form:
 *    { sort_heb      : Sort order for hebrew {Number};
 *      sort_grk      : Sort order for greek {Number};
 *      sort_bsb      : Sort order for english {Number};
 *      language      : The language of this entry (Hebrew | Greek} {String};
 *      vs            : The verse number {Number};
 *      wlc           : Text from the Westminster Leningrad Codex / Nestle Base
 *                      {String};
 *      tranlit       : The transliteration of the source {String};
 *      type_of_speech: Type-of-speech identification {String};
 *      parsing       : A label for `type_of_speech` {String};
 *      strongs       : The Strongs reference for this entry {Number};
 *      verse         : The full verse identification (e.g. 'Genesis 1:1')
 *                      {String};
 *      verse_bsb     : The english translation {String};
 *      bdb           : Notes from the Brown-Driver-Briggs lexicon {String};
 *
 *      [heading]     : The section heading {String};
 *      [footnotes]   : Any related footnotes {String};
 *      [xref]        : Any cross references (in 'Book c:v' format) {String};
 *    }
 *
 *  From this will be generated interlinear verse items, multiples for each
 *  verse, of the form:
 *    { language    : The language of this entry (Hebrew | Greek) {String};
 *      wlc         : Text from the Westminster Leningrad Codex / Nestle Base
 *                    {String};
 *      tranlit     : The transliteration of the source {String};
 *      tos         : Type-of-speech identification {String};
 *      tos_label   : A label for `tos` {String};
 *      strongs     : The Strongs reference for this entry {Number};
 *      text        : The english translation {String};
 *      bdb         : Notes from the Brown-Driver-Briggs lexicon {String};
 *
 *      [heading]   : The section heading {String};
 *      [footnotes] : Any related footnotes {String};
 *      [xref]      : Any cross references (in 'Book c:v' format) {String};
 *    }
 *
 */
const Path          = require('path');
const Fs            = require('fs');
const Readline      = require('readline');
const Books         = require('../../books');
const Refs          = require('../../refs');
const { make_dir }  = require('../../make_dir');
const Parse         = require('./parse').parse;
const Version       = require('./version').Version;

// Constants used later
const {
  PATH_CACHE,
  PATH_CSV,
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
              outPath   : Path.join( PATH_CACHE, Version.abbreviation ),
              force     : false,
              verbosity : 0,
            }, config||{} );

  if (! Fs.existsSync( config.inPath ) ) {
    await Parse( {outPath: config.inPath} );
  }

  // Create the output path
  await make_dir( config.outPath );

  const versPath  = Path.join( config.outPath, 'version.json' );

  if (config.force || ! Fs.existsSync( versPath ) ) {
    console.log('>>> %s : cache version data ...', Version.abbreviation);
    Fs.writeFileSync( versPath, JSON.stringify( Version, null, 2 )+'\n' );

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

  return new Promise((resolve, reject) => {
    const inputStream       = Fs.createReadStream(  path_csv );
    const rl                = Readline.createInterface({
      input: inputStream,
      crlfDelay: Infinity
    });

    const state = {
      out_dir         : path_json,
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

      console.log('>>> Finished parsing the %s lines of csv',
                    state.nlines.toLocaleString());

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
 *
 *  @return Updated state {Object};
 *  @private
 */
function _finishBook( state ) {
  // We have existing book data that needs to be complete
  const cur_ref = state.cur_ref;
  const fir_ref = state.first_ref;

  if (state.chap_map.size > 0) {
    // Finalize any pending chapter
    _finishChapter( state );
  }

  const bkJson  = _mapJson( state.book_map );
  if (bkJson != null) {
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

    // Convert the book to JSON and output
    const path_json = Path.join( state.out_dir, `${state.cur_ref.book}.json` );
    const json      = {
      metadata: [],
      chapters: bkJson,
    };

    console.log('>>>> %s [%s.%s-%s.%s] ...',
                fir_ref.book, fir_ref.chapter, fir_ref.verse,
                cur_ref.chapter, cur_ref.verse);

    Fs.writeFileSync( path_json, JSON.stringify( json, null, 2 )+'\n' );
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
  toJson,
};
