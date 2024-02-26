const parse     = require('../parse');
const generate  = require('../generate');
const Books     = require('../../lib/books');

/**
 *  Attach routes, initializing anything required to use them.
 *  @method attach
 *  @param  router  The target Express router {Router};
 *  @param  config  Top-level configuration/state {Object};
 *
 *  Routes:
 *    GET /api/v1/versions
 *      Fetch metadata about the set of available versions as well as a map
 *      providing book ordering and location information.
 *
 *        => 200    : {
 *            total   : {Number},
 *            versions: [ Version, ... ],
 *            books   : [ {abbrev, name, loc, [order], [verses]}, ... ],
 *           }
 *        => [45]xx : { error }
 *
 *    GET /api/v1/versions/:id
 *      Fetch metadata about a single version
 *        => 200    : Version
 *        => [45]xx : { error }
 *
 *    GET /api/v1/versions/:id/:ref
 *      Fetch the references verse(s) from the target version where `:ref` has
 *      the form:
 *        BOOK[.chapter[.verse[-[.chapter].verse]]]
 *
 *        => 200    : { total: {Number}, verses:[ Verse, ... ] }
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

  router.get( '/versions/:id/:ref', (req,res) => {
    _verses_get( config, req, res );
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
    /* Execute query, limiting the number of results and fields while
     * simultaneously initiating a count of the full match set.
     */
    const options = {
      sort  : sort,
      skip  : ((page - 1) * limit),
      limit : limit,
    };
    const fields  = {
      _id               : 0,
      id                : 1,
      type              : 1,
      abbreviation      : 1,
      language          : 1,
      local_abbreviation: 1,
      local_title       : 1,
      title             : 1,
      vrs               : 1,
    };

    const cursor  = $versions.find( query, options ).project( fields );
    const count   = $versions.count( query );
    const json    = {
      total   : -1,
      versions: await cursor.toArray(),

      // Return books of the Old and New Testament
      books   : Books.getBooks( '*' ),
    };

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
 *  Required request parameters/query (req.params | req.query):
 *    id      The id of the target version {String | Number};
 *
 *  @return A promise for results {Promise};
 *  @private
 */
async function _version_get( config, req, res ) {
  const $versions = config.mongodb.collections.versions;
  const id        = (req.params.id || req.query.id);
  const version   = await _fetch_version( id, $versions );

  console.log('_version_get( %s ): %s ...',
              id, (version ? version.abbreviation : null) );

  if (version) {
    res.status( 200 )
      .json( version );

  } else {
    // Version not found
    const json  = { error: `Unknown version ${id}` };

    res.status( 404 )
      .json( json );
  }
}

/**
 *  Fetch verses.
 *  @method _verses_get
 *  @param  config  Top-level configuration/state {Object};
 *  @param  req     The incoming request {Request};
 *  @param  res     The outgoing response {Response};
 *
 *  Required request parameters/query (req.params | req.query):
 *    id      The id of the target version {String | Number};
 *    ref     The reference to the target verse(s) {String};
 *              VERS.BOOK[.chapter[.verse[-[.chapter].verse]]]
 *
 *  @return A promise for results {Promise};
 *  @private
 */
async function _verses_get( config, req, res ) {
  const $versions = config.mongodb.collections.versions;
  const id        = ( req.params.id  || req.query.id );
  const refStr    = ( req.params.ref || req.query.ref );

  console.log('_verses_get(): id[ %s ], ref[ %s ] ...', id, refStr);

  // Attempt to find the target version
  const version = await _fetch_version( id, $versions );
  if (version == null) {
    // Version not found
    const json  = { error: `Unknown version ${id}` }

    res.status( 404 )
      .json( json );
    return;
  }

  // Parse/validate the incoming reference
  const ref = parse.reference( refStr );
  if (ref instanceof Error) {
    const json  = { error: `Invalid ref ${refStr}: ${ref.message}` };

    res.status( 404 )
      .json( json );
    return;
  }

  // Generate the set of verse references represented by the given ref.
  const ids = generate.verse_ids( ref );

  // Pull all target verses
  const col   = config.mongodb.db.collection( version.abbreviation );
  const query = { _id : { $in: ids } };
  const opts  = { sort: { _id: 1 } };
  const verses  = await col.find( query, opts ).toArray();

  // Generate the final result
  const json  = {
    total : verses.length,
    verses: verses.reduce( (obj,entry) => {
              const id              = entry._id;
              const [ bk, ch, vs ]  = id.split('.');
              delete entry._id;

              obj[ id ] = entry;
              return obj;
            }, {}),
  };

  /*
  console.log('_verses_get( %s ):', refStr, _inspect(json));
  // */

  res.status( 200 )
    .json( json );
}

/**
 *  Retrieve the identified version.
 *  @method _fetch_version
 *  @param  id          The id of the target version {String | Number};
 *  @param  [col=null]  The versions collection {Collection};
 */
async function _fetch_version( id, col=null ) {
  const id_num    = parse.num( id );
  const ID        = (typeof(id) === 'string'
                        ? id.toUpperCase()
                        : id);

  if (col == null)  { col = config.mongodb.collections.versions }

  /*
  console.log('_fetch_version(): id[ %s ]', id);
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
  const doc   = await col.findOne( query );

  /*
  console.log('_fetch_version(): id[ %s ], doc:', id, doc);
  // */

  return doc;
}
/* Private helpers }
 ****************************************************************************/

module.exports = { attach };
