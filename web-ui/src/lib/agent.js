/**
 *  An simple, client-side agent to consolidate all external fetch requests.
 *
 */

// Only include on the client side {
export const csr = true;
export const ssr = false;
// Only include on the client side }

import { get }            from "svelte/store";
import { user, errors }   from '$lib/stores';

// dev {
const BASE_API_URL  = 'http://localhost:4000/api/v2';
/* } prod {
const BASE_API_URL  = 'https://api.ayia.nibious.com/api/v1';
// prod } */

/**
 *  The Agent (singleton)
 */
export const Agent  = {
  /**
   *  Perform an authentication-aware GET request to an API endpoint.
   *
   *  @method get
   *  @param  path            The API endpoint path {String};
   *  @param  [config]        Additional configuration and data {Object};
   *  @param  [config.fetch]  The fetch method {Function};
   *  @param  [config.data]   Additional data to encode in the request
   *                          {Object};
   *
   *  @return A promise for results {Promise};
   *          - on success, resolved with the decoded response data {Object};
   *          - on failure, rejected with an error {Error};
   */
  get( path, config=null) {
    return _send( 'GET', path, config );
  },

  /**
   *  Perform an authentication-aware PUT request to an API endpoint.
   *
   *  @method put
   *  @param  path            The API endpoint path {String};
   *  @param  [config]        Additional configuration and data {Object};
   *  @param  [config.fetch]  The fetch method {Function};
   *  @param  [config.data]   Additional data to encode in the request
   *                          {Object};
   *
   *  @return A promise for results {Promise};
   *          - on success, resolved with the decoded response data {Object};
   *          - on failure, rejected with an error {Error};
   */
  put( path, config=null) {
    return _send( 'PUT', path, config );
  },

  /**
   *  Perform an authentication-aware POST request to an API endpoint.
   *
   *  @method post
   *  @param  path            The API endpoint path {String};
   *  @param  [config]        Additional configuration and data {Object};
   *  @param  [config.fetch]  The fetch method {Function};
   *  @param  [config.data]   Additional data to encode in the request
   *                          {Object};
   *
   *  @return A promise for results {Promise};
   *          - on success, resolved with the decoded response data {Object};
   *          - on failure, rejected with an error {Error};
   */
  post( path, config=null) {
    return _send( 'POST', path, config );
  },

  /**
   *  Perform an authentication-aware DELETE request to an API endpoint.
   *
   *  @method del
   *  @param  path            The API endpoint path {String};
   *  @param  [config]        Additional configuration and data {Object};
   *  @param  [config.fetch]  The fetch method {Function};
   *  @param  [config.data]   Additional data to encode in the request
   *                          {Object};
   *
   *  @return A promise for results {Promise};
   *          - on success, resolved with the decoded response data {Object};
   *          - on failure, rejected with an error {Error};
   */
  del( path, config=null) {
    return _send( 'DELETE', path, config );
  },
};

export default Agent;

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Perform an authentication-aware GET request to an API endpoint.
 *
 *  @method get
 *  @param  method          The HTTP method (e.g. GET POST, PUT) {String};
 *  @param  path            The API endpoint path {String};
 *  @param  [config]        Additional configuration and data {Object};
 *  @param  [config.fetch]  The fetch method {Function};
 *  @param  [config.data]   Additional data to encode in the request
 *                          {Object};
 *
 *
 *  @return A promise for results {Promise};
 *          - on success, resolved with the decoded response data {Object};
 *          - on failure, rejected with an error {Error};
 */
async function _send( method, path, config=null) {
  const _fetch  = (config && config.fetch || fetch);
  const data    = (config && config.data);
  const headers = [];
  const opts    = { method, headers };
  const user_ro = get( user );  // Don't want to subscribe
  const token   = (user_ro && user_ro.token);
  let   url     = _get_api_url( path );

  // Require a JSON response
  headers['Accept'] = 'application/json';

  if (data != null) {
    if (method === 'GET') {
      // Encode data as URL parameters
      url += _encode_params( url, data );

    } else {
      // Encode data in the body as JSON
      headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify( data );
    }
  }

  if (token) {
    // Include an authorization header
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response  = await _fetch( url, opts );
  if (response.status === 401) {
    /*
    const cur_url = location.pathname + location.hash + location.search;
    const path    = '/login' + _encode_params( {redirect_to: cur_url} );

    logout_with_redirect( path );
    // */

    console.warn('=== Unauthorized: need to logout');
    return;
  }

  /* If _fetch was NOT provided by svelte (i.e. is window.fetch), validate the
   * content-type.
   */
  if (_fetch === fetch) {
    const contentType = response.headers.get('content-type');

    /*
    console.log('>>> Agent._send(): response.content-type:', contentType);
    // */

    if (contentType == null || contentType.slice(0,16) !== 'application/json') {
      // Unsupported content type
      const text  = await response.text();

      throw new Error('Unexpected content type in server response', {
        cause: {
          url,
            contentType,

            expected: 'application/json',
            status  : response.status,
            text    : text,
        },
      });
    }
  }

  // Decode the JSON
  const json  = await response.json();

  /* Update our store if the response includes:
   *    user  {Object};
   *    token {String};
   */
  if (json.hasOwnProperty('user') && typeof(json.user) === 'object') {
    // Store the entire user
    user.set( json.user );

  } else if (json.hasOwnProperty('token')) {
    // Store the authentication token
    user.update( (prev) => {
      if (prev == null) { prev = {} }

      return {...prev, token: json.token};
    });
  }

  return json;
}

/**
 *  Given data to be sent via GET, add key/value pairs as URL-encoded
 *  parameters.
 *
 *  @method _encode_params
 *  @param  data  The data to endcode {Object};
 *
 *  @return URL-encoded parameters {String};
 *  @private
 */
function _encode_params( data ) {
  const specRe  = /[/&<>?]/;
  const params  = [];

  Object.entries( data ).forEach( ([key, val]) => {
    if (val == null)  { return }

    /* Only encode the value if it contains a special charracter relative to
     * the full URL (e.g. / & < > ? )
     */
    const safeVal = (specRe.text( val )
                      ? encodeURIComponent( val )
                      : val);

    params.push( `${key}=${safeVal}` );
  });

  return (params.length > 0 ? `?${params.join('&')}` : '');
}

/**
 *  Given an endpoint path return the full API URL.
 *
 *  @method _get_api_url
 *  @param  path    The endpoint path {String};
 *
 *  @return The full URL {String};
 *  @private
 */
function _get_api_url( path ) {
  return `${BASE_API_URL}/${path}`;
}

/* Private helpers }
 ****************************************************************************/
