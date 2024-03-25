import { browser }  from '$app/environment';
import { error }    from '@sveltejs/kit';
import { get }      from "svelte/store";

import {
  config    as config_store,
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
  let   config  = get( config_store );

  if (browser) {
    /* Browser-side: SHOULD have access to `config` pushed by the server into
     * the config store.
     */
    console.log('+layout.js: browser, config_store:', config);
    if (config == null) {
      const url = `${location.origin}/config`;
      console.log('+layout.js: browser, fetch config:', url);

      config = await Agent.get( url, {fetch} );

      console.log('+layout.js: browser, config:', config);

      config_store.set( config );
    }

  } else if (typeof(global) === 'object' && global.config) {
    /* Server-side with 'global.config' : push the config into a store to
     * provide client-side access.
     */
    console.log('+layout.js: server, global.config:', global.config);

    config = global.config;
    config_store.set( config );
  }

  const path  = '/versions';

  const versions  = await Agent.get( path, {fetch} );

  // Place the 'versions' data in our reactive store
  versions_store.set( versions );

  return {
    config  : config,
    versions: versions,
  };

  error(404, 'Not found');
}
