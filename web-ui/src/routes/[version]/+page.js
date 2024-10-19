import { redirect } from '@sveltejs/kit';
import { get }      from "svelte/store";

import { version, verse }  from '$lib/stores';

/**
 *  Check if we need to redirect to a deeper page.
 *
 *  @method load
 *
 *  @return void;
 */
export function load() {
  if (version == null || verse == null) { return }

  const version_ro  = get( version.primary );
  const verse_ro    = get( verse );
                        
  if (version_ro && verse_ro) {
    let path  = `/${ version_ro.abbreviation }/${ verse_ro.url_ref }`;

    console.log('/[version]/+page.js: redirect[302]:', path);
    redirect( 302, path );
  }
}
