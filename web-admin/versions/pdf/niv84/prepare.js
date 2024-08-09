/**
 *  This implements the 'prepare' step in the processing workflow to generate a
 *  normalized, database ready JSON format.
 *
 *  For this version, this work is performed in the 'extract' step, so this
 *  is just an alias entry that directs there.
 */
const Path        = require('path');

const { Version } = require('./version');
const Extract     = require('./extract');

/****************************************************************************
 * Public methods {
 *
 */

/**
 *  Convert data for the Interlinear version of the Berean Standard Bible
 *  extracted via `Niv84.extract.version()` into a normalized, database ready
 *  JSON format.
 *
 *  @method prepare_version
 *  @param  [config]                  Fetch configuration {Object};
 *  @param  [config.vers = 'NIV84']   The target version {String};
 *  @param  [config.version = null]   If provided, pre-fetched information
 *                                    about the target version
 *                                    (Niv84.fetch.find()). If this is
 *                                    provided, `config.vers` may be omitted
 *                                    {Version};
 *  @param  [config.inPath  = null] A specific input path {String};
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
  const ABBR  = Version.abbreviation;

  if (config && config.verbosity) {
    console.log('>>> Prepare %s: redirect to Extract '
                +         '(should have already completed) ...',
                ABBR);
  }

  const res = await Extract.version( config );
  let   version;

  if (config && config.returnVersion) {
    // Pass along cache location information
    version = res;

    /* version._cache SHOULD be created by Extract.version()
     *  assert( version._cacheh != null );
     */
    version._cache.prepare = version._cache.extract;
  }

  return (config.returnVersion ? version : config.outPath);
}

/* Public methods }
 ****************************************************************************/

module.exports = {
  version : prepare_version,
};
