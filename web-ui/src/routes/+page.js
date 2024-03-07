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
 *
 *  @return void;
 */
export function load() {
  if (version_stores == null || verse == null) { return }

  const version_ro  = get( version_stores.primary );
  const verse_ro    = get( verse );
                        
  if (version_ro) {
    let path  = `/${ version_ro.abbreviation }`;

    if (verse_ro) {
      path += `/${ verse_ro.api_ref }`;
    }

    console.log('/+page.js: redirect[302]:', path);
    redirect( 302, path );
  }
}
