/**
 *  Extract data for the PDF version of the NIV-1984 Bible fetched via
 *  `Niv84.fetch.version()` into a PDF, one per book.
 *
 *  Note: This extractor performs both the extract and prepare steps, meaning
 *        that `Niv84.prepare.version()` is simply an alias for
 *        `Niv84.extract.version()`.
 */
const Path        = require('path');
const Fs          = require('fs');
const { readdir } = require('fs/promises');
const Niv84       = require('../../../lib/niv84-pdf2json');

const FsUtils     = require('../../../lib/fs_utils');
const Books       = require('../../../lib/books');
const Refs        = require('../../../lib/refs');

// Constants used later
const {
  PATH_CACHE,
  SOURCE_URL,
  PATH_PDF,
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
 *  @param  [config.vers = 'NIV84']   The target version {String};
 *  @param  [config.version = null]   If provided, pre-fetched information
 *                                    about the target version
 *                                    (Niv84.fetch.find()). If this is provided,
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
              inPath        : PATH_PDF,
              outPath       : Path.join( PATH_CACHE, ABBR ),
              force         : false,
              verbosity     : 0,
              version       : version,
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
    // Process all PDF files
    await _process_pdfs( config );

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
 *  Proess all fetched PDF files, generating a single JSON file for each.
 *
 *  @method _process_pdfs
 *  @param  config                  Fetch configuration {Object};
 *  @param  config.version          If provided, pre-fetched information
 *                                  about the target version
 *                                  (Niv84.fetch.find()). If this is provided,
 *                                  `config.vers` may be omitted {Version};
 *  @param  config.inPath           The path to the input PDF files {String};
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
async function _process_pdfs( config ) {
  const version = config.version;
  const ABBR    = version.abbreviation;

  // Fetch a list of PDFs from `config.inPath`
  const files = await readdir( config.inPath );

  for (const file of files ) {
    if (! file.endsWith('.pdf')) { continue }

    const fullPath  = Path.join( config.inPath, file );

    if (config.verbosity > 1) {
      console.log('>>> Extract %s: %s begin { ...',
                  ABBR, file);
    }

    await Niv84.parseBook( fullPath, config.outPath );

    if (config.verbosity > 1) {
      console.log('>>> Extract %s: %s complete }',
                  ABBR, file);
    }
  }

  return true;
}

/* Private helpers }
 ****************************************************************************/

module.exports = {
  version : extract_version,
};
