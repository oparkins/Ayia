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

  console.log('ChapterYvers(): version:', version);

  /*  External properties }
   *************************************************************************
   *  Imports {
   *
   */
  import { beforeUpdate, tick } from 'svelte';

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
  let selecting     = false;

  // As soon as this component has been updated, activate all popovers
  beforeUpdate(async () => {
    await tick();
    activate_notes( container_el );
  });

  /**
   *  Handle a click on a verse.
   *
   *  @method click_verse
   *  @param  event     The triggering event {Event};
   *
   *  @return void
   */
  function click_verse( event ) {
    const target  = event.target;

    /* Do NOT respond to clicks within:
     *  1. A note label;
     *  2. Note content;
     */
    const isNoteLabel = target.closest('.note-label');
    if (isNoteLabel != null) { return }

    const isNoteContent = target.closest('.note-content');
    if (isNoteContent != null) { return }

    // Locate the nearest parent with a 'v' attribute
    const verse = event.target.closest('[v]');
    if (verse == null) { return }

    // Identify the verse number and determine if the current verse is selected
    const verse_num = verse.getAttribute('v');
    const select    = (! verse.hasAttribute('selected'));

    if (select) {
      // Locate ALL related verse elements and add a 'selected' attribute
      const verses  = container_el.querySelectorAll(`[v="${verse_num}"]`);
      verses.forEach( verse => {
        verse.setAttribute( 'selected', 'true' );
      });

      // Update 'selecting' (on the chapter container)
      selecting = true;

    } else {
      // Locate ALL selected verse elements and remove the 'selected' attribute
      const selected  = container_el.querySelectorAll('[selected="true"]');
      selected.forEach( verse => {
        verse.removeAttribute( 'selected' );
      });

      // Update 'selecting' (on the chapter container)
      selecting = false;
    }

    /* Update 'selecting' based upon whether there are any 'selected' children
    const selected  = container_el.querySelectorAll('[selected="true"]');
    selecting = ( selected.length > 0 );
    // */
  }

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

<div class='content yvers { Css.content.join(' ') }'
     selecting={ selecting }
      role='presentation'
      on:click={ click_verse }
      bind:this={container_el} >
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
