const { MongoClient } = require('mongodb');

/**
 *  Generate a mongo client connected to the primary database/collection.
 *  @method connect
 *  @param  config    The mongodb portion of the top-level configuration/state
 *                    {Object};
 *
 *  @note   `config` will be updated to include:
 *            mongodb.client    The connected MongoClient {MongoClient};
 *
 *            IF `config.mongodb.collection_map` exist, it should be an array
 *            of the form:
 *              %use_name%: '%dbName%.%collectionName'
 *              ...
 *
 *            This will result in connections to the named database(s) and
 *            collection(s) with additioonal entries added to
 *            `config.mongodb.db` object keyed by %use_name%.
 *
 *  @return A promise for results {Promise};
 *          - on success, a connection object {Object};
 *                        { client, db, collections:{ ... } }
 *          - on failure, an error {Error};
 */
async function connect( config ) {
  const user    = config.user;
  const pass    = encodeURIComponent( config.password );
  const dbName  = config.database;
  const uri     = `mongodb://${user}:${pass}@${config.host}:${config.port}/`
                +     dbName;

  /*
  console.log('>>> mongo.connect(): to %s ...',
              uri.replace(/:\/\/[^@]*@/, '://***:***@') );
  // */

  const client  = new MongoClient( uri );
  await client.connect();

  // Connect to the primary database
  const db      = client.db( dbName );
  const paths   = (config.collection_map &&
                   typeof(config.collection_map) === 'object'
                    ? config.collection_map
                    : {}
                  );
  const dbCols  = {
    /* Collections keyed by be normalized collection names
     * (i.e. the keys from `mongodb.collection_map`)
     */
  };

  /* Pre-attach to named collections using a consistent/configured collection
   * name.
   */
  Object.entries( paths ).forEach( ([name, colName]) => {
    if (colName) {
      dbCols[ name ] = db.collection( colName );

      /*
      console.log('>>>> mongo.connect(): db.%s => '
                  +                     'dbName[ %s ], colName[ %s ]',
                  name, dbName, colName);
      // */
    }
  });

  // Make the database connection available
  return {
    client,
    db,
    collections: dbCols,
  };
}

module.exports = connect;
