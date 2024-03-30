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

  /* Make use of `version` to remove the svelte warning about an unused
   * property.
   */
  console.log('ChapterYvers(): version:', version);

  /*  External properties }
   *************************************************************************
   *  Imports {
   *
   */
  import { afterUpdate } from 'svelte';

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
  let target_verse  = null;

  // As soon as this component has been updated, activate all popovers
  afterUpdate(async () => {
    /*
    console.log('ChapterYvers.afterUpdate(): target_verse %s== verse:',
                (target_verse === verse ? '=' : '!'), verse);
    // */

    if (target_verse === verse) { return }

    /* New target verse -- remove any current verse selection, activate notes
     * and, if a verse number was requested, select and scroll.
     */
    remove_selection();

    const notes       = activate_notes( container_el );
    const verse_nums  = (verse && verse.verses);
    if (Array.isArray( verse_nums )) {
      // Locate all portions of all target verse(s)
      const selector  = verse_nums.map( num => `[v="${num}"]` ).join(',');
      const verses    = container_el.querySelectorAll( selector );
      const first     = verses.item( 0 );

      if (first) {
        /*
        console.log('ChapterYvers.afterUpdate(): scrollIntoView:', first);
        // */

        // Select all portions of the target verse(s)
        verse_nums.forEach( num => select_verse( num, verses ) );

        // Scroll the first of the target verse(s) into view
        first.scrollIntoView({ behavior: 'auto', block: 'center'});

        /* Only update the target verse AFTER it has been rendered and we've
         * located it.
         */
        target_verse = verse;
      }

    } else if (notes.length > 0) {
      /* No verse number so, once we've activated at least one note, remember
       * the target verse to avoid activating the same notes multiple times.
       */
      target_verse = verse;
    }
  });

  /**
   *  Select the numbered verse.
   *
   *  @method select_verse
   *  @param  verse_num The verse number {Number};
   *  @param  [verses]  The set of target verses ([v="${verse_num}"])
   *                    {NodeList};
   *
   *  @return void
   */
  function select_verse( verse_num, verses=null ) {
    // Locate the nearest parent with a 'v' attribute
    if (! (verses instanceof NodeList)) {
      verses = container_el.querySelectorAll(`[v="${verse_num}"]`);
    }

    /*
    console.log('ChapterYvers.select_verse( %s ): %d elements ...',
                verse_num, verses.length);
    // */

    verses.forEach( verse => {
      verse.setAttribute( 'selected', 'true' );
    });

    selecting = true;
  }

  /**
   *  Remove verse selection.
   *
   *  @method remove_selection
   *
   *  @return void
   */
  function remove_selection() {
    const selected  = container_el.querySelectorAll('[selected="true"]');
    selected.forEach( verse => {
      verse.removeAttribute( 'selected' );
    });

    // Update 'selecting' (on the chapter container)
    selecting = false;
  }

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
      // Selet the target verse.
      select_verse( verse_num );

    } else {
      // Remove verse selection
      remove_selection();

    }
  }

  /*  Local state/Methods }
   *************************************************************************
   *  Styling {
   */
  const Css = {
    content: [
      'w-full',
      'h-full',
      'pb-14',

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
    { verse.ui_ref } [ { verse.url_ref } ]
  {:else}
    Select the desired verse above
  {/if}
</div>
