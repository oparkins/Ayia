const parse = require('../parse');

/**
 *  Attach routes, initializing anything required to use them.
 *  @method attach
 *  @param  router  The target Express router {Router};
 *  @param  config  Top-level configuration/state {Object};
 *
 *  Routes:
 *    GET /api/v1/versions
 *      Fetch metadata about the set of available versions
 *
 *        => 200    : { total: {Number}, versions:[ Version, ... ] }
 *        => [45]xx : { error }
 *
 *    GET /api/v1/versions/:id
 *      Fetch metadata about a single version
 *        => 200    : Version
 *        => [45]xx : { error }
 */
function attach( router, config ) {
  // Attach routes
  router.get( '/versions', (req,res) => {
    _versions_get( config, req, res );
  });

  router.get( '/versions/:id', (req,res) => {
    _version_get( config, req, res );
  });
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Fetch metadata about the available versions.
 *  @method _versions_get
 *  @param  config  Top-level configuration/state {Object};
 *  @param  req     The incoming request {Request};
 *  @param  res     The outgoing response {Response};
 *
 *  @return A promise for results {Promise};
 *  @private
 */
async function _versions_get( config, req, res ) {
  const $versions = config.mongodb.collections.versions;
  let   sort      = { abbreviasion: 1 };
  let   limit     = 0;
  let   page      = 1;
  const query 	  = {};

  if (req.query.page != null) {
    page = parse.num( req.query.page, page );
  }
  if (req.query.limit != null) {
    limit = parse.num( req.query.limit, limit );
  }

  // Handle filters
  if (req.query.language) {
    query.vrs = req.query.language.toLowerCase();

    /*
    query.language = { iso_639_3: req.query.language };
    // */
  }

  try {
    /* Execute query, limiting the number of results while simultaneously
     * initiating a count of the full match set.
     */
    const options = {
      sort  : sort,
      skip  : ((page - 1) * limit),
      limit : limit,
    };

    /*
    console.log('_versions_get(): query:', query);
    // */

    const cursor  = $versions.find( query, options );
    const count   = $versions.count( query );
    const json    = {
      total   : -1,
      versions: [],
    };

    // Await cursor results, flattening them into a single array
    for await (const version of cursor) {
      json.versions.push( version );
    }

    /* Await the count and, regardless of success/failutre finalize and return
     * results.
     */
    count
      .then( total => {
        console.log('_versions_get(): total[ %s ], returning[ %s ]',
                    total, json.versions.length);

        json.total = total;
      })
      .catch(err => {
        // Count error
        json.total = -1;
        json.error = 'Count '+ err.toString();
      })
      .finally( () => {
        res.status( 200 )
          .json( json );
      });

  } catch(ex) {
    /* General error
     * :NOTE: This doesn't seem to catch low level errors from the mongo
     *        library...
     *
     */
    json.total = -1;
    json.error = 'Exception '+ ex.toString();

    res.status( 200 ).json( json );
  }
}

/**
 *  Fetch metadata about a single version.
 *  @method _version_get
 *  @param  config  Top-level configuration/state {Object};
 *  @param  req     The incoming request {Request};
 *  @param  res     The outgoing response {Response};
 *
 *  @note Uses `req.params.id` or `req.query.id` to identify the target
 *        version.
 *
 *  @return A promise for results {Promise};
 *  @private
 */
async function _version_get( config, req, res ) {
  const $versions = config.mongodb.collections.versions;
  const id        = (req.params.id || req.query.id);
  const id_num    = parse.num( id );
  const ID        = (typeof(id) === 'string'
                        ? id.toUpperCase()
                        : id);

  /*
  console.log('_version_get(): id[ %s ]', id);
  // */

  const query = {
    $or: [
      {_id               : id},
      {id                : id_num},
      {abbreviation      : ID},
      {local_abbreviation: ID},
      {local_title       : id},
    ],
  };
  const doc   = await $versions.findOne( query );

  /*
  console.log('_version_get(): id[ %s ], doc:', id, doc);
  // */

  res.status( 200 )
    .json( doc );
}

/* Private helpers }
 ****************************************************************************/

module.exports = { attach };
