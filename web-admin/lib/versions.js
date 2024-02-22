/**
 *  Consolidation point for Yvers and Interlinear versions.
 *
 */
const Yvers       = require('./yvers');
const Interlinear = require('./interlinear');

/**
 *  Fetch the current version index either cached or from the source.
 *  @method fetch_versions
 *  @param  [config]                Fetch configuration {Object};
 *  @param  [config.lang = 'eng']   The target language {String};
 *  @param  [config.type = 'all']   The target type {String};
 *  @param  [config.outPath = null] Override the default cache path {String};
 *  @param  [config.force = false]  If truthy, fetch even if the data is
 *                                  already cached {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, resolves with the version index {Array};
 *          - on failure, rejects  with an error {Error};
 */
async function fetch_versions( config=null ) {
  const versions  = [];

  config  = Object.assign({
              lang      : 'eng',
              type      : 'all',
              force     : false,
              verbosity : 0,
            }, config || {});

  try   {
    const yvers = await Yvers.fetch.versions( config );
    
    versions.push( ...yvers );

  } catch { /* squelch */ }

  try   {
    const il  = await Interlinear.fetch.versions( config )

    versions.push( ...il );

  } catch { /* squelch */ }

  return versions;
}

/**
 *  Find information about the named version from the version index.
 *
 *  @method find_version
 *  @param  config                  Fetch configuration {Object};
 *  @param  config.vers             The target version {String};
 *  @param  [config.force = false]  If truthy, fetch even if the data is
 *                                  already cached {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, resolves with the version information {Object};
 *          - on failure, rejects  with an error {Error};
 */
async function find_version( config ) {
  if (config == null) { throw new Error('Missing required config') }
  if (config.vers == null) {
    throw new Error('Missing required config.vers | config.versions');
  }

  const VERS      = config.vers.toUpperCase();
  const versions  = await fetch_versions( config );
  const version   = versions.find( (data) => {
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

  return version;
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
    if (config.vers == null) {
      throw new Error('Missing required config.vers | config.versions');
    }

    // Fetch information about the target version
    version = await find_version( config );
    if (version == null) {
      throw new Error(`Cannot find version ${config.vers}`);
    }
  }

  config = Object.assign({version}, config || {});

  let res;
  if (version.type === 'interlinear') {
    res = Interlinear.fetch.version( config );

  } else {
    res = Yvers.fetch.version( config );
  }

  return res;
}

/**
 *  Extract the data for the named version.
 *
 *  @method extract_version
 *  @param  config                  Extract configuration {Object};
 *  @param  config.vers             The target version {String};
 *  @param  [config.version = null] If provided, pre-fetched information about
 *                                  the target version. If this is provided,
 *                                  `config.vers` may be omitted {Version};
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
    if (config.vers == null) {
      throw new Error('Missing required config.vers | config.versions');
    }

    // Fetch information about the target version
    version = await find_version( config );
    if (version == null) {
      throw new Error(`Cannot find version ${config.vers}`);
    }

    config = Object.assign({version}, config || {});
  }

  let res;
  if (version.type === 'interlinear') {
    res = Interlinear.extract.version( config );

  } else {
    res = Yvers.extract.version( config );
  }

  return res;
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

  let version = config.version;
  if (version == null) {
    if (config.vers == null) {
      throw new Error('Missing required config.vers | config.versions');
    }

    /* Ensure version data has been extracted and retrieve the top-level
     * version information.
     */
    const configExtract = {
      vers          : config.vers,
      verbosity     : config.verbosity,
      returnVersion : true,
    };

    version = await extract_version( configExtract );
    if (version == null) {
      throw new Error(`Cannot find version ${config.vers}`);
    }

    // Pass version down
    config = Object.assign({version}, config || {});
  }

  let res;
  if (version.type === 'interlinear') {
    res = Interlinear.prepare.version( config );

  } else {
    res = Yvers.prepare.version( config );
  }

  return res;
}

module.exports  = {
  list    : fetch_versions,

  find    : find_version,
  fetch   : fetch_version,
  extract : extract_version,
  prepare : prepare_version,
};
