/**
 *  PDF utilities.
 *
 *  :NOTE: PDF parsers should generate a yvers-compatible JSON format
 *
 */
const Fs    = require('fs');
const Niv84 = require('./niv84');

/* Available Interlinear versions
 *
 * Each should include a `_handler` object with:
 *    fetch(   config )
 *    extract( config )
 *    prepare( config )
 *
 *  Each can accept a `config` of the form:
 *    { inPath    : A specific input path [pre-configured location] {String};
 *      outPath   : A specific output path [pre-configured location] {String};
 *      force     : If truthy, fetch even if the output file already exists
 *                  [false] {Boolean};
 *      verbosity : Verbosity level [0] {Number};
 *    }
 */
const Versions  = [
  Niv84.Version,
];

/****************************************************************************
 * Public methods {
 *
 */

/**
 *  Fetch the current version index either cached or from the source.
 *  @method getVersions
 *  @param  [lang = 'eng']  The target language {String};
 *  @param  [type = 'all']  The target type {String};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, resolves with the version index {Array};
 *          - on failure, rejects  with an error {Error};
 */
async function getVersions( lang='eng', type='all') {
  return Versions;
}

/**
 *  Fetch the current version index either from cache or the source.
 *
 *  @method fetch_versions
 *  @param  [config]                Fetch configuration {Object};
 *  @param  [config.lang = 'eng']   The target language {String};
 *  @param  [config.type = 'all']   The target type {String};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, resolves with the version index {Array};
 *          - on failure, rejects  with an error {Error};
 */
async function fetch_versions( config=null) {
  return Versions;
}

/**
 *  Fetch the data for the named version either from cache or the source.
 *
 *  @method fetch_version
 *  @param  config                  Fetch configuration {Object};
 *  @param  config.vers             The target version {String};
 *  @param  [config.version = null] If provided, pre-fetched information about
 *                                  the target version. If this is provided,
 *                                  `config.vers` may be omitted {Version};
 *  @param  [config.outPath = null] A specific output path, overriding the
 *                                  default cache {String};
 *  @param  [config.force = false]  If truthy, fetch even if the data is
 *                                  already cached {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *  @param  [config.returnVersion = false]
 *                                  If truthy, return the top-level version
 *                                  data {Boolean};
 *
 *  @return A promise for results {Promise};
 *          - on success, the path to the fetched data or the version data
 *                        {String | Version};
 *          - on failure, rejects  with an error {Error};
 */
async function fetch_version( config ) {
  if (config == null) { throw new Error('Missing required config') }

  let version = config.version;
  if (version == null) {
    /* :XXX: Perform minimal discovery here leaving the heavy lifting to the
     *       version-specific handlers.
     */
    if (config.vers == null) {
      throw new Error('Missing required config.vers | config.versions');
    }

    // Fetch information about the target version
    version = await find_version( config.vers );
    if (version == null) {
      throw new Error(`Cannot find version ${config.vers}`);
    }

    // Pass this version data down
    config.version = version;
    if (config.vers == null) {
      throw new Error('Missing required config.vers | config.versions');
    }

    // Fetch information about the target version
    version = await find_version( config.vers );
    if (version == null) {
      throw new Error(`Cannot find version ${config.vers}`);
    }

    // Pass this version data down
    config.version = version;
  }

  return version._handler.fetch( config );
}

/**
 *  Find information about the named version from the version index.
 *
 *  @method find_version
 *  @param  vers  The target version {String};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, resolves with the version information {Object};
 *          - on failure, rejects  with an error {Error};
 */
async function find_version( vers ) {
  const versions  = await fetch_versions();
  const VERS      = vers.toUpperCase();
  const info      = versions.find( (data) => {
    if (data.abbreviation       === VERS ||
        data.local_abbreviation === VERS) {
      return true;
    }

    if (data.title) {
      const TITLE = data.title.toUpperCase();
      if (TITLE === VERS) { return true }
    }

    if (data.local_title) {
      const TITLE = data.local_title.toUpperCase();
      if (TITLE === VERS) { return true }
    }

    return false;
  });

  return info;
}

/**
 *  Extract the data for the named version.
 *
 *  @method extract_version
 *  @param  config                  Fetch configuration {Object};
 *  @param  config.vers             The target version {String};
 *  @param  [config.version = null] If provided, pre-fetched information about
 *                                  the target version. If this is provided,
 *                                  `config.vers` may be omitted {Version};
 *  @param  [config.inPath = null]  A specific input path, overriding the
 *                                  default cache {String};
 *  @param  [config.outPath = null] A specific output path, overriding the
 *                                  default cache {String};
 *  @param  [config.force = false]  If truthy, fetch even if the data is
 *                                  already cached {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *  @param  [config.returnVersion = false]
 *                                  If truthy, return the top-level version
 *                                  data {Boolean};
 *
 *  @return A promise for results {Promise};
 *          - on success, the path to the fetched data or the version data
 *                        {String | Version};
 *          - on failure, rejects  with an error {Error};
 */
async function extract_version( config ) {
  if (config == null) { throw new Error('Missing required config') }

  let version = config.version;
  if (version == null) {
    /* :XXX: Perform minimal discovery here leaving the heavy lifting to the
     *       version-specific handlers.
     */
    if (config.vers == null) {
      throw new Error('Missing required config.vers | config.versions');
    }

    // Fetch information about the target version
    version = await find_version( config.vers );
    if (version == null) {
      throw new Error(`Cannot find version ${config.vers}`);
    }

    // Pass this version data down
    config.version = version;
  }

  return version._handler.extract( config );
}

/**
 *  Convert a Bible version fetched and extracted via `Yvers.extract()` to a
 *  normalized, database ready JSON format.
 *
 *  @method prepare_version
 *  @param  config                  Conversion configuration {Object};
 *  @param  config.vers             The target version {String};
 *  @param  [config.version = null] If provided, extracted information for the
 *                                  target version (Yvers.extract.version()).
 *                                  If this is provided, `config.vers` may be
 *                                  omitted {Version};
 *  @param  [config.outPath = null] A specific output path for the generated
 *                                  JSON {String};
 *  @param  [config.force = false]  If truthy, convert even if the output
 *                                  already exists {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *  @param  [config.returnVersion = false]
 *                                  If truthy, return the top-level version
 *                                  data {Boolean};
 *
 *  @return A promise for results {Promise};
 *          - on success, the path to the location holding the generated JSON
 *                        data or the top-level version data
 *                        {String | Version};
 *          - on failure, an error {Error};
 *
 */
async function prepare_version( config ) {
  if (config == null) { throw new Error('Missing required config') }

  config  = Object.assign({
              force     : false,
              verbosity : 0,
            }, config || {});

  let version = config.version;
  if (version == null) {
    /* :XXX: Perform minimal discovery here leaving the heavy lifting to the
     *       version-specific handlers.
     */
    if (config.vers == null) {
      throw new Error('Missing required config.vers | config.versions');
    }

    // Fetch information about the target version
    version = await find_version( config.vers );
    if (version == null) {
      throw new Error(`Cannot find version ${config.vers}`);
    }

    // Pass this version data down
    config.version = version;
  }

  return version._handler.prepare( config );
}

/**
 *  Get the data for the named version.
 *  @method getVersion
 *  @param  vers                    The target version {String};
 *  @param  [config]                Fetch configuration {Object};
 *  @param  [config.force = false]  If truthy, fetch even if the output file
 *                                  already exists {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, resolves with the version information {Object};
 *                          {
 *                            id          : 1588,
 *                            abbreviation: 'AMP',
 *                            title: 'Amplified Bible',
 *                            language: { ... },
 *                            publisher_id: 37,
 *                            platforms: { ... },
 *                            offline: { ... },
 *                            metadata_build: 9,
 *                            vrs: 'eng',
 *                            ...
 *                            books: { Map
 *                              BOOK: { Map
 *                                1:  Chapter1-decodedData,
 *                                2:  Chapter2-decodedData,
 *                                ...
 *                              },
 *                              ...
 *                            }
 *                            cache: `/path/to/cached/data`,
 *                          }
 *          - on failure, rejects  with an error {Error};
 */
function getVersion( vers, config=null ) {
  config  = Object.assign({
              force     : false,
              verbosity : 0,
            }, config||{} );

  return new Promise((resolve, reject) => {
    find_version( vers )
      .then( version => {
        if (version == null) {
          throw new Error(`Unknown version [ ${vers} ]`);
        }

        return version._handler.fetch( config )
                .then( path => { return [path, version] } );
      })
      .then( ([path,version]) => {
        version.cache = path;

        resolve( version );
        return version;
      })
      .catch( err => {
        return reject( err );
      });
  });
}

/**
 *  Fetch the data for the named version and convert it to JSON format.
 *  @method toJson
 *  @param  vers                    The target version {String};
 *  @param  [config]                Fetch configuration {Object};
 *  @param  [config.forceParse = false]
 *                                  If truthy, parse even if the output file
 *                                  already exists {Boolean};
 *  @param  [config.forceJson = false]
 *                                  If truthy, generate JSON even if the output
 *                                  file already exists {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, resolves with the version information {Object};
 *                          {
 *                            id          : 1588,
 *                            abbreviation: 'AMP',
 *                            title: 'Amplified Bible',
 *                            language: { ... },
 *                            publisher_id: 37,
 *                            platforms: { ... },
 *                            offline: { ... },
 *                            metadata_build: 9,
 *                            vrs: 'eng',
 *                            ...
 *                            books: { Map
 *                              BOOK: { Map
 *                                1:  Chapter1-decodedData,
 *                                2:  Chapter2-decodedData,
 *                                ...
 *                              },
 *                              ...
 *                            }
 *                            cache: `/path/to/cached/data`,
 *                          }
 *          - on failure, rejects  with an error {Error};
 */
function toJson( vers, config=null ) {
  config  = Object.assign({
              forceParse: false,
              forceJson : false,
              verbosity : 0,
            }, config||{} );

  const config_parse  = {...config, force: config.forceParse};
  const config_json   = {...config, force: config.forceJson};

  return new Promise((resolve, reject) => {
    find_version( vers )
      .then( version => {
        if (version == null) {
          throw new Error(`Unknown version [ ${vers} ]`);
        }

        return version._handler.parse( config_parse )
                .then( path => { return [path, version] } );
      })
      .then( ([path,version]) => {
        version.cache = {csv:path};

        return version._handler.toJson( config_json )
                .then( path => { return [path, version] } );
      })
      .then( ([path, version]) => {
        version.cache.json = path;

        resolve( version );
        return version;
      })
      .catch( err => {
        return reject( err );
      });
  });
}

/* Public methods }
 ****************************************************************************/

module.exports  = {
  fetch : {
    versions  : fetch_versions,
    version   : fetch_version,
    find      : find_version,
  },

  extract : {
    version   : extract_version,
  },

  prepare : {
    version   : prepare_version,
  },

  getVersions,
  findVersion : find_version,
  getVersion,
  toJson,
};
// vi: ft=javascript
