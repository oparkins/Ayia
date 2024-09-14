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

    // Perform any fixups needed for this version data
    await _fixup_versions( config );

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

/**
 *  Perform fixup of the fetched versions data to ensure 'offline' information
 *  exists for each entry.
 *
 *  @method _fixup_versions
 *  @param  [config]                Fetch configuration {Object};
 *  @param  [config.lang = 'eng']   The target language {String};
 *  @param  [config.type = 'all']   The target type {String};
 *  @param  [config.outPath = null] Override the default cache path {String};
 *  @param  [config.force = false]  If truthy, fetch even if the data is
 *                                  already cached {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *
 *  @return A promise for results {Promise};
 *          - on success, resolves with the updated JSON {Object};
 *          - on failure, rejects  with an error {Error};
 *  @private
 */
async function _fixup_versions( config ) {
  const offline_base  = 'https://offline-bibles-cdn.youversionapi.com/'
                      +     'bible/text/offline';
  const known_builds  = { // As of 2024-09-02
    // Publisher: Build => %offline_base%/%pub%-%build%.zip
       1:  27,  /* KJV */            8:  12,  /* AMPC */
      12:  25,  /* ASV */           31:   9,  /* BOOKS */
      37:  18,  /* CEB */           42:  10,  /* CPDV */
      55:  22,  /* DRC1752 */       59:  17,  /* ESV */
      68:  12,  /* GNT */           69:  15,  /* GNTD */
      70:  14,  /* GW */            72:  21,  /* HCSB */
      90:   9,  /* LEB */           97:  21,  /* MSG */
     100:  16,  /* NASB1995 */     105:  11,  /* NCV */
     107:  16,  /* NET */          110:   9,  /* NIrV */
     111:  32,  /* NIV11 */        113:  22,  /* NIVUK11 */
     114:  19,  /* NKJV */         116:  21,  /* NLT */
     130:   8,  /* TOJB2011 */     206:  52,  /* engWEBUS */
     294:  13,  /* CEVUK */        296:  16,  /* GNBUK */
     303:  12,  /* CEVDCI */       314:  12,  /* TLV */
     316:   7,  /* TS2009 */       392:  12,  /* CEV */
     406:  11,  /* ERV */          416:  11,  /* GNBDC */
     431:  10,  /* GNBDK */        463:   8,  /* NABRE */
     477:   8,  /* RV1885 */       478:   7,  /* DARBY */
     546:   7,  /* KJVAAE */       547:   7,  /* KJVAE */
     821:   7,  /* YLT98 */       1047:   5,  /* GWC */
    1077:   5,  /* JUB */         1171:   6,  /* MEV */
    1204:  77,  /* WEBBE */       1207:  79,  /* WMBBE */
    1209:  75,  /* WMB */         1275:   6,  /* CJB */
    1359:   3,  /* ICB */         1365:   6,  /* MP1650 */
    1588:  10,  /* AMP */         1713:  30,  /* CSB */
    1849:   7,  /* TPT */         1922:   6,  /* RV1895 */
    1932:   9,  /* FBV */         2015:   4,  /* NRSVCI */
    2016:   4,  /* NRSV */        2017:   9,  /* RSV-C */
    2020:   8,  /* RSV */         2079:  10,  /* EASY */
    2135:   3,  /* NMV */         2163:   3,  /* enggnv */
    2407:   3,  /* WBMS */        2530:   7,  /* PEV */
    2692:   9,  /* NASB2020 */    2753:   3,  /* RAD */
    3010:   4,  /* TEG */         3034:   3,  /* BSB */
    3051:   3,  /* MP1781 */      3345:  11,  /* LSB */
    3427:   7,  /* TCENT */       3523:   7,  /* NRSVUE */
    3548:   4,  /* RSVCI */       3633:   3,  /* FNVNT */
    3915:   1,  /* OYBCENGL */
  };

  const data          = Fs.readFileSync( config.outPath );
  const json          = JSON.parse( data );
  const versions      = json.response.data.versions;

  versions.forEach( version => {
    if (version.offline == null) {
      const id    = version.id;
      const build = known_builds[ id ];

      if (build == null) {
        console.error('*** _fixup_version(): %s (%s) has no known build',
                      version.abbreviation, id);
      } else {
        version.offline = {
          build: { min: build, max: build },
          url:   `${offline_base}/${id}-${build}.zip`,
        };

        if (config.verbosity) {
          console.log('>>> Augment %s (%s) with offline version info:',
                      version.abbreviation, id, version.offline);
        }
      }
    }
  });

  Fs.writeFileSync( config.outPath, JSON.stringify(json) );

  return json;
}

/* Private helpers }
 ****************************************************************************/

module.exports  = {
  versions  : fetch_versions,
  version   : fetch_version,

  find      : find_version,
};
