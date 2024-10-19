<script>
  /**
   *  Present the content of a single chapter within a controller the provides
   *  the target version, book, verse (ref), and chapter content.
   *
   *  @element  Chapter
   *  @prop     content_loading   Indicates whether `content` is currently
   *                              being loaded {Boolean};
   *  @prop     column            The column in which this chapter is presented
   *                              (primary | column#) {String};
   *  @prop     version           The current version {Version};
   *  @prop     book              The target book {Book};
   *  @prop     verse             The target verse {VerseRef};
   *  @prop     content           Chapter content for the current `version`,
   *                              `book`, and `verse` {Object};
   *
   *  Required contexts:
   *    version
   *    verse
   *
   *  External properties {
   */
  export let content_loading  = true;
  export let column           = null;   // The column for this chapter
  export let version          = null;   // The target version
  export let book             = null;   // The target book
  export let verse            = null;   // The target verse
  export let content          = null;   // Chapter content

  /*  External properties }
   *************************************************************************
   *  Imports {
   *
   */
  import { getContext, afterUpdate, tick }  from 'svelte';
  import { get, writable, derived }   from 'svelte/store';
  import {
    afterNavigate,
    goto,
    replaceState,
  } from '$app/navigation';

  import {
    selected  as selected_store,
  }  from '$lib/stores';

  import VerseText        from '$lib/VerseText.svelte';
  import VerseYvers       from '$lib/VerseYvers.svelte';
  import VerseInterlinear from '$lib/VerseInterlinear.svelte';

  const version_stores  = getContext( 'version' );
  const verse_store     = getContext( 'verse' );

  /*  Imports }
   *************************************************************************
   *  Local state/methods {
   */
  let   container_el  = null;
  let   verse_el      = VerseText;
  const is_loading    = writable( content_loading || true );

  const version_store = version_stores[ column ];
  const is_selecting  = derived( selected_store, ( $selected_store ) => {
    return (Array.isArray( $selected_store ) && $selected_store.length > 0);
  });

  /**
   *  Update the component based upon `version.type`
   *
   *  @method update_el
   *  @param  version     The new version {Version};
   *
   *  @return void
   */
  function update_el( version ) {
    if (version == null)  { return }

    switch( version.type ) {
      case 'pdf':
        // :fall-through: PDF parsers generate a yvers-compatible format

      case 'yvers':
        verse_el = VerseYvers;
        break;

      case 'interlinear':
        verse_el = VerseInterlinear;
        break;

      default:
        verse_el = VerseText;
        break;
    }
  }

  // After any navigation, reset is_loading
  afterNavigate( ( navigation ) => {
    /*
    console.log('Chapter.afterNavigate(): '
                +   'is_loading[ %s => true ]',
                String( $is_loading ) );
    // */

    is_loading.set(  true );
  });

  /* As soon as this component has been updated, select and scroll to any
   * target verse.
   */
  afterUpdate(async () => {
    const verses  = (container_el
                        ? container_el.querySelectorAll( '[v]' )
                        : []);
    /*
    console.log('Chapter.afterUpdate(): %d verses, '
                +     'have_content[ %s ], '
                +     'is_loading[ %s ]',
                verses.length,
                String( content != null ),
                String( $is_loading ) );
    // */

    if (verses.length < 1) {
      /* Either we do not yet have access to our container element OR we do not
       * yet have verse elements. In either case, force `is_loading` to true to
       * indicate that we're still loading.
       */
      /*
      console.log('Chapter.afterUpdate(): no verses, '
                  +   'is_loading[ %s => true ]',
                  String( $is_loading ) );
      // */

      is_loading.set( true );
      return;
    }

    /************************************************************************
     * Once content is fully available and we've fully rendered, a 'rendered'
     * attribute will be added to `container_el` to indicate that we have
     * fully rendered.
     *
     * This ensures that even in the case of cached page navigation, we can
     * identify whether we have completed our initialization.
     */

    /*
    console.log('Chapter.afterUpdate(): %d verses, '
                +     'is_selecting[ %s : %s ], verse:',
                verses.length,
                String( $is_selecting ),
                ($is_selecting ? $selected_store.join(', ') : 'null'),
                verse );
    // */

    // Update is_loading
    is_loading.set( false );
  });

  /**
   *  When `is_loading` changes, perform final initialization.
   *
   *  @method loading_changed
   *  @param  is_loading    The new value of `$is_loading` {Boolean};
   */
  async function loading_changed( is_loading ) {
    if (is_loading) { return }

    await tick();

    // Ensure selection matches our selection state.
    if (! $is_selecting) {
      remove_selection();

    } else {
      select_verses( $selected_store );

      // On first full render, scroll the selected verse into view
      scroll_into_view();
    }
  }

  /**
   *  Scroll the first of the selected verses into view.
   *
   *  @method scroll_into_view
   */
  function scroll_into_view() {
    const verse_nums  = ($is_selecting && $selected_store);

    /*
    console.log('Chapter.scroll_into_view(): verse_nums:', verse_nums);
    // */

    if (! Array.isArray( verse_nums) || verse_nums.length < 1) {
      return;
    }

    // Locate all portions of all target verse(s)
    const selector  = `[v="${verse_nums[0]}"]`;
    const first     = container_el.querySelector( selector );

    /*
    console.log('Chapter.scroll_into_view(): first:', first);
    // */

    if (first) {
      // Scroll the first of the target verse(s) into view
      first.scrollIntoView({ behavior: 'auto', block: 'center'});
    }
  }

  /**
   *  Triggered whenever $verse_store changes, determine whether we are moving
   *  to a new verse. If so, reset 'is_selecting'.
   *
   *  @method reset_selecting
   *  @param  new_version The (new) version in `$version_store` {Version};
   *  @param  new_verse   The (new) verse in `$verse_store` {Verse};
   *
   *  @return void
   */
  function reset_selecting( new_version, new_verse ) {
    const version_changed = (version !== new_version);
    const verse_changed   = (verse !== new_verse);

    /*
    console.log('Chapter.reset_selecting(): version_changed[ %s ]:',
                String(version_changed), new_version);
    console.log('Chapter.reset_selecting(): verse_changed[ %s ]:',
                String(verse_changed), new_verse);
    // */

    // Switching to a new version or verse so reset our local state
    selected_store.set( null )

    if (version_changed) {
      version = new_version;

      // When changing versions, reset is_loading
      is_loading.set( true );

    }

    if (verse_changed) {
      verse = new_verse;
    }

    const verse_nums  = (verse && verse.verses);
    if (Array.isArray( verse_nums ) && verse_nums.length > 0) {
      // Update the set of selected verses
      /*
      console.log('Chapter.reset_selecting(): Set selected verses to:',
                  verse_nums.join(', '));
      // */

      selected_store.set( verse_nums );
    }
  }

  /**
   *  Select all verses in the current selection.
   *
   *  @method select_verses
   *  @param  verse_nums  The set of verse numbers to select {Array};
   */
  function select_verses( verse_nums ) {
    /*
    console.log('Chapter.select_verses(): verse_nums:',
                  verse_nums);
    // */

    // Deselect any currently selected verses
    deselect_verses();

    if (! Array.isArray( verse_nums) || verse_nums.length < 1) {
      return;
    }

    // Locate all portions of all target verse(s)
    const selector  = verse_nums.map( num => `[v="${num}"]` ).join(',');
    const verses    = container_el.querySelectorAll( selector );

    if (verses.length > 0) {
      // Select all portions of the target verse(s)
      verse_nums.forEach( num => select_verse( num, verses ) );
    }
  }

  /**
   *  Remove 'selected' from all verses that currently have the attribute.
   *
   *  @method deselect_verses
   */
  function deselect_verses() {
    const selected  = (container_el
                        ? container_el.querySelectorAll('[selected="true"]')
                        : []);
    selected.forEach( el => {
      el.removeAttribute( 'selected' );
    });
  }

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
    const selected  = get( selected_store ) || [];
    if (! selected.includes( verse_num )) {
      selected.push( verse_num );
    }

    // Locate the nearest parent with a 'v' attribute
    if (! (verses instanceof NodeList)) {
      verses = container_el.querySelectorAll(`[v="${verse_num}"]`);
    }

    /*
    console.log('Chapter.select_verse( %s ): [ %s ], %d elements ...',
                verse_num,
                selected.join(', '),
                verses.length);
    // */
    verses.forEach( el => {
      el.setAttribute( 'selected', 'true' );
    });

    selected_store.set( selected );
  }

  /**
   *  Remove verse selection.
   *
   *  @method remove_selection
   *
   *  @return void
   */
  function remove_selection() {
    deselect_verses();

    // Update 'is_selecting' (on the chapter container)
    selected_store.set( null );
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

    /* Do NOT respond to clicks if:
     *  1. A tool-tip is visible;
     *  2. The click target is:
     *     a. a note label;
     *     b. within note content;
     *     c. a hover-trigger;
     *
     * :NOTE: Interlinear tooltips are added and remove from the DOM as needed.
     */
    const toolTips  = document.querySelectorAll( '[role="tooltip"]' );
    if (toolTips && toolTips.length > 0) { return }

    const isNoteLabel = target.closest('.note-label');
    if (isNoteLabel != null) { return }

    const isNoteContent = target.closest('.note-content');
    if (isNoteContent != null) { return }

    const isTrigger = target.closest('.hover-trigger');
    if (isTrigger != null) { return }

    // Locate the nearest parent with a 'v' attribute
    const el = event.target.closest('[v]');
    if (el == null) { return }

    // Identify the verse number and determine if the current verse is selected
    const verse_num = el.getAttribute('v');
    const select    = (! el.hasAttribute('selected'));

    /*
    console.log('Chapter.click_verse(): verse_num[ %s ], select[ %s ]:',
                verse_num, String( select ), el);
    // */

    if (select) {
      // Selet the target verse.
      select_verse( verse_num );

    } else {
      // Remove verse selection
      remove_selection();

    }
  }

  /* Whenever `$version_store` or `$verse_store` change, trigger
   * reset_selecting()
   */
  $: reset_selecting( $version_store, $verse_store );

  // When `version` changes, update the verse element
  $: update_el( $version_store );

  // When `is_loading` changes, perform scrolling.
  $: loading_changed( $is_loading );

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
    ],

    body: [
    ],
  };

  /*  Styling }
   *************************************************************************/
</script>

<div class='content { Css.content.join(' ') }'
     selecting={ $is_selecting }
      role='presentation'
      on:click={ click_verse }
      bind:this={container_el} >
  {#if $is_loading}
    Loading { verse.ui_ref } ...
  {/if}
  <div class='body { Css.body.join(' ') }'
       style='{ `display: ${ $is_loading ? 'none' : 'block'}` }'>
   {#if content && content.verses}
    {#if (book && verse) }
      <div class='chapter header'>
        <span class='chapter name'>{ book.name }</span>
        <span class='chapter number'>{ verse.chapter }</span>
      </div>
    {/if}
    {#each Object.entries(content.verses) as [verse_ref, verse]}
      <svelte:component
          this={      verse_el }
          verse_ref={ verse_ref }
          verse={     verse }
      />
    {/each}
   {:else if verse}
    Select the desired version below
   {:else}
    Select the desired verse below
   {/if}
  </div>
</div>
