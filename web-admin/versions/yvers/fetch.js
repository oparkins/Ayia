/**
 *  Fetch Bible version data from either cache or the source.
 *
 */
const Fs    = require('fs');
const Path  = require('path');

const {
  YVERS_URL,

  PATH_CACHE,
} = require('./constants');

const { fetch } = require('../../lib/fetch');

/****************************************************************************
 * Public methods {
 *
 */

/**
 *  Fetch the current version index either from cache or the source.
 *
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
async function fetch_versions( config=null) {
  config  = Object.assign({
              lang      : 'eng',
              type      : 'all',
              force     : false,
              verbosity : 0,
            }, config || {});

  if (config.outPath == null) {
    config.outPath = _cachePath( `versions-${config.lang}.json` );
  }

  const isCached  = Fs.existsSync( config.outPath );

  if (config.force || ! isCached) {
    // Fetch the index
    const url = `${YVERS_URL}/api/bible/versions`
              +     `?language_tag=${config.lang}&type=${config.type}`;

    // Require a content-type of 'application/json'
    config.contentType = 'application/json';
    await fetch( url, config );

  } else if (config.verbosity) {
    console.log('>>> Use existing cache: %s', config.outPath);
  }

  // Open the cached data, parse it as JSON and return
  const data      = Fs.readFileSync( config.outPath );
  const json      = JSON.parse( data );
  const versions  = json.response.data.versions;

  // Augment each version with our type information
  versions.forEach( version => { version.type = 'yvers' } );

  return versions;
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
    version = await find_version( config.vers );
    if (version == null) {
      throw new Error(`Cannot find version ${config.vers}`);
    }
  }

  // Update `config` using the official abbreviation
  const ABBR  = version.abbreviation;

  config  = Object.assign({
              outPath   : _cachePath( `${ABBR}.zip` ),
              force     : false,
              verbosity : 0,
            }, config || {});

  const isCached  = Fs.existsSync( config.outPath );

  if (config.force || ! isCached) {
    const re  = /^.*\/\//;
    const url = version.offline.url.replace( re, 'https://' );

    // Require a content-type of 'application/zip'
    config.contentType = 'application/zip';
    await fetch( url, config );

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

/**
 *  Find information about the named version from the version index.
 *
 *  @method find_version
 *  @param  vers    The target version {String};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, resolves with the version information {Object};
 *          - on failure, rejects  with an error {Error};
 */
async function find_version( vers ) {
  const VERS      = vers.toUpperCase();
  const versions  = await fetch_versions();
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

/* Public methods }
 ****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Given a cache file, generate the path to that cache file.
 *
 *  @method _cachePath
 *  @param  file    The cache file {String};
 *
 *  @return The cache path {String};
 *  @private
 */
function _cachePath( file ) {
  return Path.join( PATH_CACHE, file );
}

/* Private helpers }
 ****************************************************************************/

module.exports  = {
  versions  : fetch_versions,
  version   : fetch_version,

  find      : find_version,
};
