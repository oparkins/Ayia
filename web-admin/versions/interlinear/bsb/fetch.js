/**
 *  Fetch Berean Standard Bible Interliner data from either cache or the
 *  source.
 *
 */
const Fs  = require('fs');

// Constants used later
const {
  TABLES_URL,

  PATH_XLSX,
} = require('./constants');

const { fetch }   = require('../../../lib/fetch');
const { Version } = require('./version');

/****************************************************************************
 * Public methods {
 *
 */

/**
 *  Fetch the data for this version either from cache or the source.
 *
 *  @method fetch_version
 *  @param  [config]                Fetch configuration {Object};
 *  @param  [config.outPath = null] A specific output path, overriding the
 *                                  default cache  {String};
 *  @param  [config.force = false]  If truthy, fetch even if the output file
 *                                  already exists {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *  @param  [config.returnVersion = false]
 *                                  If truthy, return the top-level version
 *                                  data {Boolean};
 *
 *  @return A promise for results {Promise};
 *          - on success, the path to the fetched data or the version data
 *                        {String | Version};
 *          - on failure, an error {Error};
 */
async function fetch_version( config=null ) {
  config  = Object.assign({
              outPath       : PATH_XLSX,
              force         : false,
              verbosity     : 0,
              returnVersion : false,
            }, config||{} );

  const version     = {...Version};
  const existsXlsx  = Fs.existsSync( config.outPath );

  if (config.force || ! existsXlsx) {
    // Require a content-type representing XLSX data
    config.contentType =
     'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

    await fetch( TABLES_URL, config );

  } else if (config.verbosity) {
    console.log('>>> Use existing cache: %s', config.outPath);
  }

  if (config.returnVersion) {
    // Pass along cache location information
    version._cache = Object.assign( { fetch:config.outPath },
                                    version._cache || {} );
  }

  return (config.returnVersion ? version : config.outPath);
}

module.exports = {
  version   : fetch_version,
};
