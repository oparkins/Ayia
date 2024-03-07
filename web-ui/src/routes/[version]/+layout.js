import { error } from '@sveltejs/kit';
import { get }   from "svelte/store";

import {
  version   as version_store,
}  from '$lib/stores';

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

    /*
    console.log('[version]/+layout.js: get( %s ) ...', path);
    // */

    const version = Agent.get( path, {fetch} );
    version.then( res => {
      // Place the 'version' data in our reactive store
      version_store.primary.set( res );

      return res;
    });

    return {
      version:  await version,
    };
  }

  error(404, 'Not found');
}
