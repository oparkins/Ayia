const Express = require('express');

/*
const { expressjwt }  = require("express-jwt");
const handleAuthError = require('../lib/handleAuthError');
// */

const api_routes = {
  v1: require('./v1'),
  v2: require('./v2'),
};

/**
 *  Attach all routes to the provided Express app.
 *  @method attach_routes
 *  @param  app     The target Express app {Express};
 *  @param  config  Top-level configuration/state {Object};
 *
 *  @note `config` MUST include:
 *        - 'mongodb' that includes a connection to the mongodb client
 *          (`config.mongodb.client`).
 *
 *  @return The updated `app` {Express};
 */
function attach_routes( app, config ) {
  _validate_config( config );

  // Attach route entries by version
  Object.entries( api_routes ).forEach( ([vers, entry]) => {
    if (entry == null)  { return }

    console.log('>>> Attach api/%s ...', vers);
    const router  = entry.create_router( config );

    app.use( `/api/${vers}`, router );
  });
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Validate the incoming config for attach.
 *  @method _validate_config
 *  @param  config    The incoming configuration {Object};
 *
 *  @note `config` MUST include:
 *        - 'mongodb' that includes:
 *          - `db` {Database};
 *          - `collections` {Object}
 *            - key/value pairs identifying target collection by configurable
 *              name (e.g. config.mongodb.collections.versions).
 *
 *  @throw  Error if the config is not valid.
 *
 *  @return void
 *  @private
 */
function _validate_config( config ) {
  if (config.mongodb == null) {
    throw new Error('Missing config.mongodb');
  }
  if (config.mongodb.db == null) {
    throw new Error('Missing config.mongodb.db (Database)');
  }
  if (config.mongodb.collections == null) {
    throw new Error('Missing config.mongodb.collections (collection map)');
  }
}

/* Private helpers }
 ****************************************************************************/

module.exports = attach_routes;
