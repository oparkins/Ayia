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
const Parse     = require('./parse').parse;

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
  const keys  = [
    'sort_heb', 'sort_grk', 'sort_bsb', 'language', 'vs', 'wlc', '<=>',
    'translit', 'parsing', 'type_of_speech', 'strongs', 'verse',
    'heading', 'xref', 'vers_bsb', 'footnotes', 'bdb',
  ];

  console.log('>>> Convert CSV to JSON ...');
  return new Promise((resolve, reject) => {
    const inputStream       = Fs.createReadStream(  path_csv );
    const outputFilestream  = Fs.createWriteStream( path_json );
    const rl                = Readline.createInterface({
      input: inputStream,
      crlfDelay: Infinity
    });

    const amount_of_lines_to_ignore = 1;
    let   nlines        = 0;
    let   header        = [];
    let   first_object  = true;

    // Start our array of verses...
    outputFilestream.write("[")

    rl.on('line', (line) => {
      nlines++;

      if (nlines <= amount_of_lines_to_ignore) {
        return;
      }

      if (header.length === 0) {
        header = _csv_line_to_array( line );

      } else {
        const line_array  = _csv_line_to_array( line );
        const jsonObj     = {};
        
        for (let idex in header) {
          const key = keys[ idex ] || header[ idex ];

          jsonObj[ key ] = line_array[ idex ];
        }

        if (!first_object) {
          outputFilestream.write(',\n');

        } else {
          first_object = false
          outputFilestream.write('\n');
        }

        outputFilestream.write( '  ' );
        outputFilestream.write( JSON.stringify(jsonObj) );
      }
    });

    rl.on('error', (err) => {
      rl.close();
      return reject( err );
    });

    rl.on('close', () => {
      console.log('>>> Finished parsing the %s lines of csv',
                    nlines.toLocaleString());
      console.log('>>>   Output: %s', path_json);
      outputFilestream.write("]")

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

/* Private helpers }
 ****************************************************************************/

module.exports = {
  toJson,
};
