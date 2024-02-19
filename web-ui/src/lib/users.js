/**
 *  Client-side, JsonRpc-based access to the UserService.
 *
 *  Provided methods:
 *    register_user( user_name, password_hash )
 *    auth_password( user_name, password_hash )
 *    auth_refrsh( current_user [rpc] )
 *    auth_revoke()
 *
 *    generate_sha256( str )
 */

// Only include on the client side {
export const csr = true;
export const ssr = false;
// Only include on the client side }

import { get }          from "svelte/store";
import { get_rpc,
         sub_change,
         unsub_change}  from '$lib/rpc';
import { user, errors } from '$lib/stores';

/**
 *  Attempt to register a new user.
 *  @method register_user
 *  @param  user_name     The desired name of the new user {String};
 *  @param  password_hash The SHA-256 hash of the user's password {String};
 *
 *  @return A promise for results {Promise};
 *          - on success, resolved with the new user record {Object};
 *          - on failure, rejected with an error {code:, message:} {Object};
 */
export async function register_user( user_name, password_hash ) {
  const rpc       = await get_rpc();
  const user_data = { user_name, password_hash };
  const new_user  = await rpc.call('user.register', user_data);

  if (new_user) {
    // Success
    user.set( new_user );
  }
}

/**
 *  Attempt to authenticate a user.
 *  @method auth_password
 *  @param  user_name     The name of the target user {String};
 *  @param  password_hash The SHA-256 hash of the user's password {String};
 *
 *  @return A promise for results {Promise};
 *          - on success, resolved with the user {Object};
 *          - on failure, rejected with an error {code:, message:} {Object};
 */
export async function auth_password( user_name, password_hash) {
  const rpc   = await get_rpc();
  let   luser = get(user);

  if (luser && luser.user_name === user_name) {
    // Already authenticated as the target user
    return luser;
  }

  // Send a auth_password request and await the response
  const auth  = { user_name, password_hash };
  let   error;

  try {
    /* :XXX: Server-side should now automatically set the authenticated value
     *       of this RPC socket based upon the results of 'auth_password'
     *       removing the need to explicitly call `rpc.login()`.
     *        const rsp  = await rpc.login( auth );
     *        if (rsp) {
     *          // YES -- retrieve the authenticated user
     *          luser = await rpc.call( 'auth_password', auth );
     *        }
     */
    luser = await rpc.call( 'user.authPassword', auth );

  } catch(err) {
    console.error('rpc.auth_password( %s, %s ): FAILURE:',
                user_name, password_hash, err);
    error = (err instanceof Error
              ? {code:401, message: err.message}
              : err);
  }

  if (luser) {
    // Success
    user.set( luser );

    // (Re)Subscribe to collection change events
    sub_change( rpc );

  } else {
    // Failure
    console.error('rpc.auth_password( %s, %s ): FAILURE:',
                user_name, password_hash, error);

    user.set( null );

    // Unsubscribe to collection change events
    unsub_change( rpc );

    throw error;
  }

  return luser;
}

/**
 *  Attempt to refresh our current access token.
 *  @method auth_refresh
 *  @param  current_user  The current user {Object};
 *  @param  [rpc = null]  If provided, no need to retrieve {RPCWebSocket};
 *
 *  @return A promise for results {Promise};
 *          - on success, resolved with the updated user {Object};
 *          - on failure, rejected with an error {code:, message:} {Object};
 */
export async function auth_refresh( current_user, rpc = null ) {
  if (current_user == null) { return null }

  if (rpc == null) {
    console.log('rpc.auth_refresh(): get_rpc() ...');
    rpc = await get_rpc();
  }

  // /*
  console.log('rpc.auth_refresh(): use:', current_user);
  // */

  const auth  = {
    token:  `${current_user.token_type} ${current_user.access_token}`,
  };
  let   updated_user;
  let   error;

  try {
    // Attempt to refresh the current access token
    updated_user = await rpc.call( 'user.authRefresh', auth );

  } catch(err) {
    console.error('rpc.auth_refresh(): FAILURE:', err);
    error = (err instanceof Error
              ? {code:401, message: err.message}
              : err);
  }

  if (updated_user) {
    // Refresh success
    // /*
    console.log('rpc.auth_refresh(): SUCCESS:', updated_user);
    // */

    user.set( updated_user );

    // (Re)Subscribe to collection change events
    sub_change( rpc );

  } else {
    // Refresh failure
    console.error('rpc.auth_refresh(): FAILURE:', error);

    user.set( null );

    // Unsubscribe to collection change events
    unsub_change( rpc );

    throw error;
  }

  return get( user );
}

/**
 *  Attempt to deauthenticate the current user.
 *  @method auth_revoke
 *
 *  @return A promise for results {Promise};
 *          - on success, resolved with true | false {Boolean};
 *          - on failure, rejected with an error {code:, message:} {Object};
 */
export async function auth_revoke() {
  const rpc   = await get_rpc();
  let   luser = get(user);

  if (luser == null) { return true }

  /*
  console.log('rpc.auth_revoke():', luser);
  // */

  const auth  = {
    token:  `${luser.token_type} ${luser.access_token}`,
  };
  let   rsp;
  let   error;

  try {
    rsp = await rpc.call('user.authRevoke', auth);

  } catch(err) {
    console.error('rpc.auth_revoke(): auth[ %s ], FAILURE:',
                  JSON.stringify(auth), err);
    error = err;
  }

  if (rsp) {
    // Success
    user.set( null );

    // Unsubscribe to collection change events
    unsub_change( rpc );

  } else {
    // Failure
    throw error;
  }

  return true;
}

/**
 *  Generate a SHA-256 has of the given message
 *  @method generate_sha256
 *  @param  message   The incoming message {String};
 *
 *  @return A promise for results {Promise};
 *          - on success, resolved with the hash {String};
 *          - on failure, rejected with an error {Error};
 */
export async function generate_sha256( message ) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder().encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray.map(b => {
                    return b.toString(16).padStart(2, '0');
                  }).join('');

  return hashHex;
}
