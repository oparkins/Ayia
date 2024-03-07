import { error } from '@sveltejs/kit';
import { get }   from "svelte/store";

import {
  versions  as versions_store,
}  from '$lib/stores';

import Agent  from '$lib/agent';

/**
 *  Perform an asynchronous load based upon incoming parameters.
 *
 *  @method load
 *  @param  config    Configuratino data {Object};
 *  @param  [config.fetch]  The fetch method {Function};
 *
 *  @return A promise for results {Promise};
 *          - on success, the loaded data {Object};
 *                          { versions }
 *          - on failure, an error {Error};
 */
export async function load({ fetch, params }) {
  const path  = '/versions';

  const versions  = Agent.get( path, {fetch} );
  versions.then( res => {
    // Place the 'versions' data in our reactive store
    versions_store.set( res );

    return res;
  });

  return {
    versions: await versions,
  };

  error(404, 'Not found');
}
