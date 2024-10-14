import { error } from '@sveltejs/kit';
import { get }   from "svelte/store";

import { VerseRef, ref_num } from '$lib/verse_ref';

import {
  versions  as versions_store,
  verse     as verse_store,
}  from '$lib/stores';

import Agent  from '$lib/agent';

/**
 *  Perform an asynchronous load based upon incoming parameters.
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
 *                          { verse, content }
 *          - on failure, an error {Error};
 */
export async function load( {params, fetch, parent} ) {
  const data      = await parent();
  const verse_ref = params.verse;
  const version   = data.version;

  /*
  console.log('[version]/[verse]/+layout.js: verse_ref[ %s ], version:',
              verse_ref, version);
  // */

  if (verse_ref) {
    const versions  = get( versions_store );
    const verse     = new VerseRef( verse_ref, versions );

    if (verse.is_valid) {
      // /*
      console.log('[version]/[verse]/+layout.js: verse_ref[ %s ], '
                  +   'update verse_store:',
                  verse_ref, verse);
      // */

      verse_store.set( verse );

      /* :XXX: Don't use `verse.url_ref` directly since we really want to
       *       ensure we fetch an entire chapter.
       */
      const api_ref = `${verse.book.abbr}.${ref_num(verse.chapter)}`;
      const path    = `/versions/${version.abbreviation}/${api_ref}`;

      /*
      console.log('[version]/[verse]/+layout.js: get( %s ) ...', path);
      // */

      /* :XXX: If we attempt to pre-load the content, it will end up being
       *       loaded a second time from Version.svelte...
       */
      //const content = await Agent.get( path, {fetch} );
      return {
        ...data,
        verse   : verse,
        //content : content,
      };
    }
  }

  error(404, 'Not found');
}
