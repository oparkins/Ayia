/**
 *  Available Interlinear versions.
 *
 */
const Fs  = require('fs');
const Bsb = require('./bsb');

const Versions  = [
  Bsb.Version,
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
 *  Find information about the named version from the version index.
 *  @method findVersion
 *  @param  vers  The target version {String};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, resolves with the version information {Object};
 *          - on failure, rejects  with an error {Error};
 */
async function findVersion( vers ) {
  const versions  = await getVersions();
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
    findVersion( vers )
      .then( version => {
        if (version == null) {
          throw new Error(`Unknown version [ ${vers} ]`);
        }

        return version.handler.parse( config )
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
    findVersion( vers )
      .then( version => {
        if (version == null) {
          throw new Error(`Unknown version [ ${vers} ]`);
        }

        return version.handler.parse( config_parse )
                .then( path => { return [path, version] } );
      })
      .then( ([path,version]) => {
        version.cache = {csv:path};

        return version.handler.toJson( config_json )
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
  getVersions,
  findVersion,
  getVersion,
  toJson,
};
// vi: ft=javascript
