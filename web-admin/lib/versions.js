/**
 *  Consolidation point for Yvers and Interlinear versions.
 *
 */
const Yvers       = require('./yvers');
const Interlinear = require('./interlinear');

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
  const config    = { lang, type };
  const versions  = [];

  try   {
    const yvers = await Yvers.fetch.versions( config );
    
    versions.push( ...yvers );

  } catch { /* squelch */ }

  try   {
    const il  = await Interlinear.getVersions( lang, type )

    versions.push( ...il );

  } catch { /* squelch */ }

  return versions;
}

/**
 *  Find information about the named version from the version index.
 *  @method findVersion
 *  @param  vers    The target version {String};
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
 *  @param  vers    The target version {String};
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
 *                          }
 *          - on failure, rejects  with an error {Error};
 */
function getVersion( vers ) {
}

module.exports  = {
  getVersions,
  findVersion,
  getVersion,
};
