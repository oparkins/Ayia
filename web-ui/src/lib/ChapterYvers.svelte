<script>
  /**
   *  Present the content of a single chapter from a YVERS source within a
   *  controller the provides the target version, book, verse (ref), and
   *  chapter content.
   *
   *  @element  ChapterYvers
   *  @prop     is_loading    Indicates whether `content` is currently being
   *                          loaded {Boolean};
   *  @prop     version       The current version ('yvers') {Version};
   *  @prop     book          The target book {Book};
   *  @prop     verse         The target verse {VerseRef};
   *  @prop     content       Chapter content for the current `book` and
   *                          `verse` {Object};
   *
   *  External properties {
   */
  export let is_loading = true;
  export let version    = null;   // The target version (yvers)
  export let book       = null;   // The target book
  export let verse      = null;   // The target verse
  export let content    = null;   // Chapter content

  /*  External properties }
   *************************************************************************
   *  Imports {
   *
   */
	import { beforeUpdate, afterUpdate, tick } from 'svelte';

  import {
    show_footnotes,
    show_xrefs,
    show_redletters,
  }  from '$lib/stores';

  import { html_chapter }                 from '$lib/render/yvers';
  import { activate  as activate_notes }  from '$lib/verse_note';

  /*  Imports }
   *************************************************************************
   *  Local state/methods {
   */
  let container_el  = null;

  /**
   *  After an update has completed, activate any new popovers
   *
   *  @method activate_popovers
   *
   *  @return void
   */
  function activate_popovers() {
    console.log('ChapterYvers.activate_popovers(): container_el:',
                container_el);

    activate_notes( container_el );
  }

  // As soon as this component has been updated, activate all popovers
	beforeUpdate(async () => {
    console.log('ChapterYvers: beforeUpdate: version:', version);
    console.log('ChapterYvers: beforeUpdate: content:', content);
		await tick();
    console.log('ChapterYvers: just updated ...');
    activate_popovers();
	});
	afterUpdate(() => {
    console.log('ChapterYvers: afterUpdate ...');
  });

  /*  Local state/Methods }
   *************************************************************************
   *  Styling {
   */
  const Css = {
    content: [
      'w-full',
      'h-full',
      'pb-4',

      'overflow-y-auto',

      'text-gray-800',
      'dark:text-gray-200',

      'border-b',
      'border-gray-200',
      'dark:border-gray-600',
    ],
  };

  /*  Styling }
   *************************************************************************/
</script>

<div class='content { Css.content.join(' ') }' bind:this={container_el} >
  {#if is_loading}
    Loading { verse.ui_ref } ...
  {:else if content}
    {#if (book && verse) }
      <div class='chapter header'>
        <span class='chapter name'>{ book.name }</span>
        <span class='chapter number'>{ verse.chapter }</span>
      </div>
    {/if}

    {@html html_chapter( content, { footnotes : $show_footnotes,
                                    xrefs     : $show_xrefs,
                                    redletters: $show_redletters } ) }

  {:else if verse}
    { verse.ui_ref } [ { verse.api_ref } ]
  {:else}
    Select the desired verse above
  {/if}
</div>
