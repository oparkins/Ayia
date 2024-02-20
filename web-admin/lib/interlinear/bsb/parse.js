/**
 *  Handle parsing of the data for the Interlinear version of the Berean
 *  Standard Bible into a form suitable for toJson().
 *
 */
const Fs        = require('fs');
const ExecSync  = require('child_process').execSync;
const Readline  = require('readline');
const Fetch     = require('./fetch').fetch;

// Constants used later
const {
  PATH_XLSX,
  PATH_CSV,
} = require('./constants');

/**
 *  Parse the original data into a form that is suitable for toJson().
 *
 *  @method parse
 *  @param  [config]                Fetch configuration {Object};
 *  @param  [config.inPath  = null] A specific input XLSX path {String};
 *  @param  [config.outPath = null] A specific output CSV path {String};
 *  @param  [config.force = false]  If truthy, fetch even if the output file
 *                                  already exists {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *
 *  @return A promise for results {Promise};
 *          - on success, the path to the processed file, suitable for toJson()
 *            {String};
 *          - on failure, an error {Error};
 */
async function parse( config=null ) {
  config  = Object.assign({
              inPath    : PATH_XLSX,
              outPath   : PATH_CSV,
              force     : false,
              verbosity : 0,
            }, config||{} );

  const existsXlsx  = Fs.existsSync( config.inPath );
  const existsCsv   = Fs.existsSync( config.outPath );

  if (config.force || ! existsCsv) {
    if (! existsXlsx) {
      await Fetch( config );
    }

    // Check for dependencies like libreoffice
    try {
      ExecSync('soffice --version',
        function (error, stdout, stderr) { 
          if (! error) {
            console.log('>>> soffice version: ' + stdout);
          }
        }
      );

    } catch {
      throw new Error('LibreOffice (soffice) required to parse XLSX');
    }

    // Use libreoffice to convert XLSX to CSV
    console.log('>>> Converting translation tables to CSV via libre-office ...');
    await _xlsx_to_csv( config.inPath, config.outPath );

  } else if (config.verbosity){
    console.log('=== CSV data already generated and cached');
    console.log('===   Path: %s', config.outPath);
  }

  return config.outPath;
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Use soffice/libre-office to convert an XLSX file to CSV
 *
 *  @method _xlsx_to_csv
 *  @param  path_xlsx   The path to the (input) XLSX file {String};
 *  @param  path_csv    The path to the (output) CSV file {String};
 *
 *  @return A promise for results {Promise};
 *          - on success, true {Boolean};
 *          - on failure, and error {Error};
 *  @private
 */
function _xlsx_to_csv( path_xlsx, path_csv ) {
  return new Promise( (resolve, reject) => {
    /* Params located at:
     *  https://help.libreoffice.org/latest/en-US/text/shared/guide/csv_params.html
     */
    const cmdline = [
      'soffice',
      '--convert-to',
      'csv:"Text - txt - csv (StarCalc)":44,34,UTF8,0,,0,true,false,false,false,false,5',
      path_xlsx,
    ];
    try {
      ExecSync( cmdline.join(' '),
        { cwd: process.cwd() },
        function (error, stdout, stderr) {
          console.log('stdout: ' + stdout);
          console.log('stderr: ' + stderr);
          if (error !== null) {
            console.log('exec error: ' + error);
            return reject( error );
          }

          return resolve( true );
      });

    } catch(err) {
      return reject( err );
    }
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

/* Private helpers }
 ****************************************************************************/

module.exports = {
  parse,
};
