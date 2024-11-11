import { error } from '@sveltejs/kit';
import { get }   from "svelte/store";

import { content as content_store } from '$lib/stores';
import { VerseRef, ref_num }        from '$lib/verse_ref';

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
 *      untrace   : {Function};
 *    }
 *
 *  @return A promise for results {Promise};
 *          - on success, the loaded data {Object};
 *                          { verse }
 *          - on failure, an error {Error};
 */
export async function load( {params, fetch, parent} ) {
  const data      = await parent();
  const verse_ref = params.verse;
  const versions  = data.versions;
  const version   = data.version;

  /*
  console.log('[version]/[verse]/+layout.js: verse_ref[ %s ], version:',
              verse_ref, version);
  // */

  if (verse_ref) {
    const verse = new VerseRef( verse_ref, versions );

    if (verse.is_valid) {
      /*
      console.log('[version]/[verse]/+layout.js: verse_ref[ %s ], verse:',
                  verse_ref, verse);
      // */

      /* :XXX: Don't use `verse.url_ref` directly since we really want to
       *       ensure we fetch an entire chapter.
       */
      const api_ref       = `${verse.book.abbr}.${ref_num(verse.chapter)}`;
      const path          = `/versions/${version.abbreviation}/${api_ref}`;
      const store_content = get( content_store );
      let   new_content   = true;

      // Determine whether this will actually load new content
      if (store_content) {
        // Check if the current content matches the target version/verse
        const match_version = (store_content.version === version.abbreviation);
        const match_ref     = (store_content.api_ref === api_ref);

        if (match_version && match_ref) {
          // The content will NOT be new
          new_content = false;
        }
      }

      // /*
      console.log('[version]/[verse]/+layout.js: new_content[ %s ], '
                  +                           'get( %s ) ...',
                  String( new_content ), path);
      // */

      const content = await Agent.get( path, {fetch} );

      /* Associate this content with the target version, api_ref, and an
       * indiation of whether the content has actually changed.
       */
      content.version = version.abbreviation;
      content.api_ref = api_ref;
      content.changed = new_content;

      return {
        ...data,
        verse   : verse,
        content : content,
      };
    }
  }

  error(404, 'Not found');
}
