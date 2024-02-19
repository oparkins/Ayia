/**
 *  Client-side WebSocket-based JsonRpc.
 *
 *  Available stores:
 *    rpc     {WebSocket};
 *
 *  Provided methods:
 *    get_rpc {WebSocket};
 */

// Only include on the client side {
export const csr = true;
export const ssr = false;
// Only include on the client side }

import RPCWebSocket       from 'rpc-websockets';

import { get, writable }  from "svelte/store";

import { Bus }            from '$lib/bus';
import { user, errors }   from '$lib/stores';
import { auth_refresh }   from '$lib/users';

// Client-side message bus channel for 'collection.change' database events
export const  collection_change = Bus.channel( 'collection.change' );

// Client-side rpc store, used primarily here
export const  rpc = writable( null );

let rpc_config  = {};

/**
 *  Retrieve or create a JsonRpc to the current endpoint.
 *  @method get_rpc
 *
 *  @return The connected JsonRpc {JsonRpc};
 */
export async function get_rpc() {
  let lrpc  = get(rpc);

  if (lrpc != null) { return lrpc }

  /**************************************************************************
   * We need a new RPCWebSocket.
   *
   * First, retrieve server-side configuration to learn the web-services
   * endpoint.
   */
  const promise = new Promise( _create_rpc );
  rpc.set( promise );

  promise
    .then( lrpc => {
      rpc.set( lrpc );
    })
    .catch( err => {
      const web_services  = rpc_config.web_services;
      const rpc_host      = (web_services && web_services.host);
      const rpc_port      = (web_services && web_services.port);

      console.error('get_rpc(): connection FAILED:', err);

      if (rpc_port === 443) {
        const svc_proto = 'https';
        const svc_url = `${svc_proto}://${rpc_host}:${rpc_port}/`;

        console.warn('get_rpc(): You MAY need to visit %s in your browser '
                      + 'and approve a security exception to enable RPC',
                      svc_url);
      }

      // Reset the RPC and authenticated user
      rpc.set(  null );
      user.set( null );
    });

  return promise;
}

/**
 *  Subscribe for 'collection.change' events from the server.
 *
 *  @method sub_change
 *  @param  rpc   The current rpc connection {RPCWebSocket};
 */
export async function sub_change( rpc ) {
  // (Re)Subscribe to collection change events
  if (rpc._sub_collection_change == null) {
    console.log('=== JsonRpc.sub_change(): ...');

    rpc.on( 'collection.change', _on_change )
    rpc.subscribe( 'collection.change')
      .then( data => {
        console.log('=== JsonRpc.sub_change(): data:', data);
      });

    //rpc.on('collection.change', _on_change );
  }
}

/**
 *  Unsubscribe from 'collection.change' events from the server.
 *
 *  @method unsub_change
 *  @param  rpc   The current rpc connection {RPCWebSocket};
 */
export async function unsub_change( rpc ) {
  if (rpc._sub_collection_change != null) {
    console.log('=== JsonRpc.unsub_change(): ...');

    rpc.unsubscribe( 'collection.change');
    rpc.off( 'collection.change', _on_change )

    rpc._sub_collection_change = null;
  }
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Handle incoming 'collection.change' messages from the server.
 *  @method _on_change
 *  @param  change    The change data {Object};
 *
 *  `change` will have the form:
 *    { _id: { _data: {String} },
 *      operationType : update | insert | delete {String},
 *      clusterTime   : {Timestamp},
 *      documentKey   : { _id: {ObjectId} },
 *      ns            : {
 *        db  : Database name {String},
 *        coll: Collection name {String},
 *      },
 *      %operationType-specific-data%
 *    }
 *
 *    operationType-specific-data:
 *      delete:
 *        %no-additional-information%
 *
 *      insert:
 *        fullDocument  : {Object};
 *        documentKey   : { _id: {ObjectId} },
 *
 *      update:
 *        updateDescription : {
 *          updatedFields: {
 *            %name%: %val%,
 *            ...
 *          },
 *          removedFields: [ {String}, ... ],
 *        }
 *
 *
 *  From this, we will emit messages based upon the target collection and
 *  operation. For example:
 *    logs.delete   value:  { documentKey   : {ObjectId} }
 *    users.insert  value:  { documentKey   : {ObjectId},
 *                            fullDocument  : {Object},
 *                          }
 *    runs.update   value:  { documentKey   : {ObjectId},
 *                            updatedFields : {Object},
 *                            removedFields : {Array},
 *                          }
 *
 *
 *  @return void
 *  @private
 */
function _on_change( change ) {
  console.log('=== JsonRpc._on_change(collection.change):', change);

  const message = `${change.ns.coll}.${change.operationType}`;
  const value   = {
    documentKey : change.documentKey._id,
  };

  switch (change.operationType) {
    case 'insert':
      value.fullDocument = change.fullDocument;
      break;

    case 'update':
      // Mix-in updateDescription
      Object.assign( value, change.updateDescription );
      break;

    case 'delete':  // fall-through
    default:
      // No additional information
      break;
  }

  collection_change.publish( message, value );
}

/**
 *  Invoked whenever a JsonRpc WebSocket (re)opens.
 *  @method _on_open
 *
 *  @return void
 *  @private
 */
async function _on_open(lrpc) {
  console.log('=== JsonRpc._on_open(): ...');

  // (Re)set our rpc connection
  rpc.set( lrpc );

  /*
  console.log('=== JsonRpc._on_open: notify of our presense ...');
  // */
  lrpc.notify('Hello Server!');

  // /*
  lrpc.listMethods()
    .then( methods => {
      console.log('=== JsonRpc._on_open: listMethods:', methods);
    })
    .catch(err => {
      console.log('=== JsonRpc._on_open: listMethods FAILED:', err);
   });
  // */

  // Check if there is a currently identified user...
  let luser = get(user);
  if (luser) {
    // Yes -- attempt to refresh user authentication
    /*
    console.log('=== JsonRpc._on_open: auth_refresh:', luser);
    // */

    try {
      await auth_refresh( luser, lrpc );

    } catch(err) {
      /* pass
      console.error('*** JsonRpc._on_open: auth_refresh FAILED:', err);
      // */
    }
  }
}

/**
 *  Invoked whenever a JsonRpc WebSocket emits an error.
 *  @method _on_error
 *  @param  event   The triggering event {Event};
 *
 *  @return void
 *  @private
 */
function _on_error(lrpc, event) {
  console.log('=== JsonRpc._on_error: reconnects[ %s / %s ]:',
              lrpc.current_reconnects + 1, lrpc.max_reconnects,
              (event.error || event));

  //rpc.set( null );
}

/**
 *  Invoked whenever a JsonRpc WebSocket closes.
 *  @method _on_close
 *  @param  event   The triggering event {Event};
 *
 *  @return void
 *  @private
 */
function _on_close (lrpc, event) {
  console.log('=== JsonRpc._on_close:', event);

  rpc.set( null );
}

/**
 *  Create a new JsonRpc connection.
 *  @method _create_rpc
 *  @param  resolve   A promise resolver {Function};
 *  @param  reject    A promise rejecter {Function};
 *
 *  @return void
 *  @private
 */
async function _create_rpc( resolve, reject ) {
  const proto       = window.location.protocol;
  const host        = window.location.hostname;
  const port        = window.location.port;
  const config_url  = `${proto}//${host}:${port}/config`;

  let   lrpc        = null;
  const onError     = (event) => {
    if (lrpc.current_reconnects >= (lrpc.max_reconnects - 1)) {
      /* No more reconnects will be attempted.
       * Consider this RPC connection FAILED.
       */
      /*
      console.error('*** JsonRpc.error: reconnects[ %s / %s ]: FAILED',
                    lrpc.current_reconnects + 1, lrpc.max_reconnects);
      // */

      lrpc.close();

      return reject( event );
    }

    console.warn('=== JsonRpc.error: reconnects[ %s / %s ]: Retry ...',
                 lrpc.current_reconnects + 1, lrpc.max_reconnects);
  };

  /*
  console.log('=== Fetch configuration from %s', config_url);
  // */

  const rsp     = await fetch( config_url );

  rpc_config  = await rsp.json();

  console.log('=== Configuration from %s:', config_url, rpc_config);

  // Create a new websocket
  const web_services  = rpc_config.web_services;
  const rpc_host      = web_services.host;
  const rpc_port      = web_services.port;
  const rpc_proto     = (rpc_port === 443
                          ? 'wss'
                          : 'ws');
  const rpc_url       = `${rpc_proto}://${rpc_host}:${rpc_port}`;
  const rpc_opts      = {
    /* RPCWebSocket:
     *  https://github.com/elpheria/rpc-websockets/blob/trunk/API.md
     *      #new-websocketaddress-options---client
     *
    autoconnect       : true,
    reconnect         : true,
    reconnect_interval: 1000,
    max_reconnects    : 5,
    // */
    /* Ws:
     *  https://github.com/websockets/ws/blob/master/doc/ws.md
     *      #new-websocketaddress-protocols-options
     *
    maxPayload        : 104857600,  // 100 MiB
    // */
    /* Https.Request / Tls.connect:
     *  https://nodejs.org/api/tls.html#tlsconnectoptions-callback
     *
    rejectUnauthorized: true,
    // */
  };

  /*
  console.log('=== Open a JsonRpc to %s ...', rpc_url );
  // */

  lrpc = new RPCWebSocket.Client( rpc_url, rpc_opts );

  /*
  console.log('=== New JsonRpc socket:', lrpc.address);
  // */

  // Finally, create a promise that will resolve after the FIRST open

  // Connect an initial, temporary error handler until after 'open'
  lrpc.on('error', onError);

  lrpc.once('open', async () => {
    console.log('=== JsonRpc.open.once: COMPLETE');

    // Disconnect our initial error handler
    lrpc.off('error', onError);

    // Manually invoke our persistent open handler and wait for results
    await _on_open(lrpc);

    // Connect persistent event handlers
    lrpc.on('open',  ()      => { _on_open(lrpc) });
    lrpc.on('error', (event) => { _on_error(lrpc, event) });
    lrpc.on('close', (event) => { _on_close(lrpc, event) });

    resolve( lrpc );
  });

  /*
  lrpc.subscribe( 'event-name' );
  lrpc.on( 'event-name', () => { ... });
  // */

  //rpc.set( lrpc );
}

/* Private helpers }
 ****************************************************************************/
