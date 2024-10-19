import { error } from '@sveltejs/kit';

import Agent  from '$lib/agent';

/**
 *  Perform an asynchronous load based upon incoming parameters.
 *
 *  @method load
 *  @param  config    Configuratino data {Object};
 *
 *  `config`:
 *    { url       : {URL};
 *      params    : {Object};
 *      data      : {Object};
 *      route     : {Object};   {id: {String}}
 *      fetch     : {Function};
 *      setHeaders: {Function};
 *      depends   : {Function};
 *      parent    : {Function};
 *      untracek  : {Function};
 *    }
 *
 *  @return A promise for results {Promise};
 *          - on success, the loaded data {Object};
 *                          { version }
 *          - on failure, an error {Error};
 */
export async function load({ params, fetch, parent }) {
  const data        = await parent();
  const vers_name   = params.version;

  if (vers_name) {
    const path    = `/versions/${vers_name}`;

    // /*
    console.log('[version]/+layout.js: get( %s ) ...', path);
    // */

    const version = await Agent.get( path, {fetch} );

    console.log('[version]/+layout.js: version[ %s ]:',
                vers_name, version);

    return {
      ...data,
      version:  version,
    };
  }

  error(404, 'Not found');
}
