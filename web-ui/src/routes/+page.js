import { redirect } from '@sveltejs/kit';
import { get }      from "svelte/store";

import {
  version as version_stores,
  verse,
}  from '$lib/stores';

/**
 *  Check if we need to redirect to a deeper page.
 *
 *  @method load
 *  @param  config          Configuratino data {Object};
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
 *                          { verse }
 *          - on failure, an error {Error};
 */
export async function load( {params, fetch, parent} ) {
  const data  = await parent();
  console.log('+page.load(): data:', data);

  /*
  const data  = await parent();
  if (data.version == null || data.verse == null) {return }

  // */

  if (version_stores == null || verse == null) { return }

  const version_ro  = get( version_stores.primary );
  const verse_ro    = get( verse );
                        
  if (version_ro) {
    let path  = `/${ version_ro.abbreviation }`;

    if (verse_ro) {
      path += `/${ verse_ro.url_ref }`;
    }

    console.log('/+page.js: redirect[302]:', path);
    redirect( 302, path );
  }
}
