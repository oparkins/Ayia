/**
 *  Handle fetching of the Interlinear version of the Berean Standard Bible.
 *
 */
const Http  = require('https');
const Fs    = require('fs');

// Constants used later
const {
  TABLES_URL,
  PATH_XLSX,
} = require('./constants');

/**
 *  Fetch the data source.
 *
 *  @method fetch
 *  @param  [config]                Fetch configuration {Object};
 *  @param  [config.outPath = null] A specific output path {String};
 *  @param  [config.force = false]  If truthy, fetch even if the output file
 *                                  already exists {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *
 *  @return A promise for results {Promise};
 *          - on success, the path to the fetched file {String};
 *          - on failure, an error {Error};
 */
async function fetch( config=null ) {
  config  = Object.assign({
              outPath   : PATH_JSON,
              force     : false,
              verbosity : 0,
            }, config||{} );

  const existsXlsx  = Fs.existsSync( config.outPath );

  if (config.force || ! existsXlsx) {
    console.log('>>> Download source %s ...', TABLES_URL);

    await _fetch_url( TABLES_URL, config.outPath );

  } else if (config.verbosity) {
    console.log('=== Source data already cached');
    console.log('===   Path: %s', config.outPath);
  }

  return config.outPath;
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Fetch the given URL and write it to the provied ouptut path.
 *
 *  @method _fetch_url
 *  @param  url       The target url {String};
 *  @param  out_path  The path to the output content {String};
 *
 *  @return A promise for results {Promise};
 *          - on success, true {Boolean};
 *          - on failure, an error {Error};
 *  @private
 */
function _fetch_url( url, out_path ) {
  return new Promise( (resolve, reject) => {
    const file    = Fs.createWriteStream( out_path );
    const request = Http.get(url, (response) => {
      let err;

      response.pipe(file);

      file.on('error', (er) => { err = er });

      // after download completed close filestream
      file.on('finish', () => {
        file.close();

        if (err) {
          console.error('*** Download error:', err);
          return reject( err );

        } else {
          console.log('>>> Download Completed');
          return resolve( true );
        }
      });
    });
  });
}

/* Private helpers }
 ****************************************************************************/

module.exports = {
  fetch,
};
