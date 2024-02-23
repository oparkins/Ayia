/**
 *  Extract data for the Interlinear version of the Berean Standard Bible
 *  fetched via `Bsb.fetch.version()` into a flat CSV format suitable for
 *  `Bsb.prepare.version()`.
 *
 */
const Path      = require('path');
const Fs        = require('fs');
const CProc     = require('child_process');
const Readline  = require('readline');

// Constants used later
const {
  PATH_XLSX,
  PATH_CSV,
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
 *  @param  [config.outPath = null] A specific output CSV path {String};
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
  config  = Object.assign({
              inPath        : PATH_XLSX,
              outPath       : PATH_CSV,
              force         : false,
              verbosity     : 0,
              returnVersion : false,
            }, config||{} );

  // assert( config.vers == null || config.vers === Version.abbreviation );
  const version   = {...Version};
  const ABBR      = version.abbreviation;
  const existsCsv = Fs.existsSync( config.outPath );

  if (config.force || ! existsCsv) {
    const configFetch = { version, verbosity: config.verbosity };
    const dataPath    = await Fetch.version( configFetch );
    const soExec      = 'soffice';
    const soArgs      = [ '--version' ];

    if (config.verbosity) {
      console.log('>>> Extract %s: begin extraction from %s ...',
                  version.abbreviation, dataPath);
    }

    // Check for dependencies like libreoffice
    const [vrc, vout, verr] = await _exec( 'soffice', [ '--version' ] );
    if (vrc !== 0) {
      console.error('*** Extract %s: rc[ %s ]: %s',
                    ABBR, vrc, verr);

      throw new Error(`Extract ${ABBR}: LibreOffice (soffice) required to `
                        + 'extract from XLSX');

    } else if (config.verbosity) {
      console.log('>>> Extract %s: soffice version: %s',
                  ABBR, vout.toString().trim());
    }

    // Use libreoffice to convert XLSX to CSV
    await _xlsx_to_csv( config );

    if (config.verbosity) {
      console.log('>>> Extract %s: complete', ABBR);
    }

  } else if (config.verbosity){
    console.log('>>> Extract %s: use existing cache: %s',
                ABBR, config.outPath);
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
 *  Use soffice/libre-office to convert an XLSX file to CSV
 *
 *  @method _xlsx_to_csv
 *  @param  config                  Fetch configuration {Object};
 *  @param  config.version          If provided, pre-fetched information
 *                                  about the target version
 *                                  (Bsb.fetch.find()). If this is provided,
 *                                  `config.vers` may be omitted {Version};
 *  @param  config.inPath           The path to the input XLSX {String};
 *  @param  config.outPath          The path to the output CSV {String};
 *  @param  [config.force = false]  If truthy, fetch even if the output file
 *                                  already exists {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *
 *  @note   soffice can only use the *directory* from `path_csv`;
 *
 *  @return A promise for results {Promise};
 *          - on success, true {Boolean};
 *          - on failure, and error {Error};
 *  @private
 */
async function _xlsx_to_csv( config ) {
  const path_xlsx = config.inPath;
  const path_csv  = config.outPath;
  const ABBR      = config.version.abbreviation;

  /* Params documented at:
   *  https://help.libreoffice.org/6.2/he/text/shared/guide/start_parameters.html
   *  https://help.libreoffice.org/latest/en-US/text/shared/guide/csv_params.html
   */
  const params  = [
    '44',     // 1  Field Separator ASCII code point (e.g. 44 == ,);
    '34',     // 2  Text Delimiter  ASCII code point (e.g. 34 == ");
    'UTF8',   // 3  Character Set   (e.g. 0 == System);
    '0',      // 4  Line number to start reading;
    '',       /* 5  Cell Format Codes for Each Column in the form
               *    'column/format' */
    '0',      /* 6  Language identifier in decimal (e.g. 0 == User Interface
               *    Language); */
    'true',   // 7  Quoted field as text  (true | [false]);
    'false',  /* 8  Detect special numbers (true | false);
               *      Defaults to false for Import, true for Export */
    'false',  // 9  Save cell contents as shown ([true] | false);
    'false',  // 10 Export cell formulas (true | [false]);
    'false',  // 11 Remove spaces (true | [false]);
     '5',     /* 12 Export sheets (0 == first sheet, -1 == all sheets,
               *                   # == sheet #); */
              // 13 Import as formulas (true | [false]);
              // 14 Include a byte-order-mark (BOM) (true | [false]);
              // 15 Detect numbers in scientific notation ([true] | false);
  ];
  const args  = [
    '--quickstart',
    '--safe-mode',
    '--headless',
    '--convert-to',
    'csv:"Text - txt - csv (StarCalc)":' + params.join(','),
    '--outdir',
    Path.dirname( path_csv ),
    path_xlsx,
  ];
  const opts  = {
    cwd: process.cwd(),
  };

  if (config.verbosity > 1) {
    console.log('>>> Extract %s: Exec soffice with arguments:',
                ABBR, args);

  } else if (config.verbosity) {
    console.log('>>> Extract %s: Exec soffice to convert XLSX to CSV ...',
                ABBR);
  }

  const [rc, stdout, stderr] = await _exec( 'soffice', args, opts );
  const stdoutLines = stdout.toString().split('\n');
  const stderrLines = stderr.toString().split('\n');
  const stdoutStr   = stdoutLines.map( (line,idex) => {
                        if (idex > 0) { line = '        ' + line }
                        return line;
                      }).join('\n');
  const stderrStr   = stderrLines.map( (line,idex) => {
                        if (idex > 0) { line = '        ' + line }
                        return line;
                      }).join('\n');

  if (rc !== 0 || stderr.length > 0) {
    const vrc = (rc ? rc
                    : `${stderrLines.length} lines of stderr`);

    console.error('*** Extract %s: soffice failed [ %s ]', ABBR, vrc);
    if (stdout.length > 0) { console.error('stdout: %s', stdoutStr) }

    console.error('stderr: %s', stderrStr);

    throw new Error(`Extract ${ABBR}: soffice failed [ ${vrc} ]`);

  }

  if (config.verbosity) {
    console.log('>>> Extract %s: soffice completed [ %s ]', ABBR, rc);
    if (stdout.length > 0) { console.log('stdout: %s', stdoutStr) }
    if (stderr.length > 0) { console.log('stderr: %s', stderrStr) }
  }

  // Check if the converted file exists
  if (! Fs.existsSync( config.outPath ) ) {
    // NO. soffice says it succeeded but there is no output file
    throw new Error(`Extract ${ABBR}: FAILED to generated the output file`);
  }
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

/**
 *  Spawn a child an capture all stdout and stderr data.
 *
 *  @method _exec
 *  @param  cmd       The command {String};
 *  @param  args      The set of arguments {Array};
 *  @param  [opts={}] Additional spawn options {Object};
 *
 *  @return A promise for results {Promise};
 *          - on success, resolves with [retCode, stdout, stderr] {Array};
 *          - on failure, rejects with an error {Error};
 *  @private
 */
function _exec( cmd, args, opts={} ) {
  return new Promise((resolve, reject) => {
    const child   = CProc.spawn( cmd, args, opts );
    const stdout  = [];
    const stderr  = [];
    let   rc      = 0;

    // Capture stdout and stderr
    child.stdout.on('data', (data) => { stdout.push( data ) } );
    child.stderr.on('data', (data) => { stderr.push( data ) } );

    child.on('error', (err) => { 
      const code    = err.errno || err.code;
      const retErr  = (stderr.length > 0
                        ? Buffer.concat( stderr )
                        : err.code);

      resolve( [code, Buffer.concat( stdout ), retErr] );
    });

    child.on('close', (code) => { 
      resolve( [code, Buffer.concat( stdout ), Buffer.concat( stderr )] );
    });
  });
}

/* Private helpers }
 ****************************************************************************/

module.exports = {
  version : extract_version,
};
