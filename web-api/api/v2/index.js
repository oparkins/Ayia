const Express         = require('express');
//const handleAuthError = require('../../lib/handleAuthError');

const api_routes  = {
  versions: require('./versions'),
};

/**
 *  Create a router and attach the v2 route handlers.
 *
 *  @method create_router
 *  @param  config      Top-level configuration/state {Object};
 *
 *  @note `config` MUST include:
 *        - 'jwt' specifying the confiugration for Json Web Tokens
 *            {authenticated: JWT authentication callback }
 *
 *        - 'mongodb' that includes a connection to the mongodb client
 *          (`config.mongodb.client`).
 *
 *
 *  @return The new express router {Router};
 *  @private
 */
function create_router( config ) {
  _validate_config( config );

  const router  = Express.Router();

  // Add api-related middleware
  router.use( Express.json() );
  //router.use( handleAuthError );

  // For each provided handler, invoke its attach() method
  const handlers  = Object.entries( api_routes );
  handlers.forEach( ([key,handler]) => {
    console.log('>>>> Attach api/v2/%s ...', key);

    handler.attach( router, config );
  });

  return router;
}

/****************************************************************************
 * Private helpers {
 */

/**
 *  Validate the incoming config for any additional requirements to attach the
 *  v2 routes.
 *
 *  @method _validate_config
 *  @param  config    The incoming configuration {Object};
 *
 *  @note `config` MUST include:
 *        - 'jwt' specifying the confiugration for Json Web Tokens
 *            {authenticated: JWT authentication callback }
 *
 *        - 'mongodb' that includes a `db` containing attachments to required
 *          collections (`config.mongodb.db.articles`).
 *
 *  @throw  Error if the config is not valid.
 *
 *  @return void
 *  @private
 */
function _validate_config( config ) {
  // Required v2 collections {
  if (config.mongodb.collections.versions == null) {
    throw new Error('Missing config.mongodb.collections.versions (Collection)');
  }
  // Required v2 collections }
}

/* Private helpers }
 ****************************************************************************/

module.exports = { create_router };
