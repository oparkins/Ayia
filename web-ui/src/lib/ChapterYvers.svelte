<script>
  /**
   *  Present the content of a single chapter from a YVERS source within a
   *  controller the provides the target version, book, verse (ref), and
   *  chapter content.
   *
   *  @element  ChapterYvers
   *  @prop     is_loading    Indicates whether `content` is currently being
   *                          loaded {Boolean};
   *  @prop     column        The column in which this chapter is presented
   *                          (primary | column#) {String};
   *  @prop     version       The current version ('yvers') {Version};
   *  @prop     book          The target book {Book};
   *  @prop     verse         The target verse {VerseRef};
   *  @prop     content       Chapter content for the current `book` and
   *                          `verse` {Object};
   *
   *  External properties {
   */
  export let is_loading = true;
  export let column     = null;   // The column for this chapter
  export let version    = null;   // The target version (yvers)
  export let book       = null;   // The target book
  export let verse      = null;   // The target verse
  export let content    = null;   // Chapter content

  /* :XXX: Make use of `version` to remove the svelte warning about an unused
   *       property.
   */
  console.log('ChapterYvers(): version:', version);

  /*  External properties }
   *************************************************************************
   *  Imports {
   *
   */
  import { afterUpdate }  from 'svelte';
  import { get, derived } from 'svelte/store';
  import {
    afterNavigate,
    goto,
    replaceState,
  } from '$app/navigation';

  import {
    show_footnotes,
    show_xrefs,
    show_redletters,

    version   as version_stores,
    verse     as verse_store,
    selected  as selected_store,
  }  from '$lib/stores';

  import { html_chapter }                 from '$lib/render/yvers';
  import {
    activate  as activate_notes,
    is_active as notes_are_active,
  }  from '$lib/verse_note';

  /*  Imports }
   *************************************************************************
   *  Local state/methods {
   */
  let container_el  = null;
  let need_scroll   = false;

  const version_store = version_stores[ column ];
  const is_selecting  = derived( selected_store, ( $selected_store ) => {
    return (Array.isArray( $selected_store ) && $selected_store.length > 0);
  });

  // After any navigation, reset is_loading and need_scroll
  afterNavigate( ( navigation ) => {
    /*
    console.log('ChapterYvers.afterNavigate(): '
                +   'is_loading[ %s => true ], need_scroll[ %s => true ]',
                String( is_loading ),
                String( need_scroll ) );
    // */

    is_loading  = true;
    need_scroll = true;
  });

  // As soon as this component has been fully loaded,
  afterUpdate(async () => {
    const verses  = (container_el
                        ? container_el.querySelectorAll( '[v]' )
                        : []);
    /*
    console.log('ChapterYvers.afterUpdate(): %d verses, '
                +     'have_content[ %s ], '
                +     'is_loading[ %s ], '
                +     'need_scroll[ %s ]',
                verses.length,
                String( content != null ),
                String( is_loading ),
                String( need_scroll ));
    // */

    if (verses.length < 1) {
      /* Either we do not yet have access to our container element OR we do not
       * yet have verse elements. In either case, force `is_loading` to true to
       * indicate that we're still loading.
       */
      /*
      console.log('ChapterYvers.afterUpdate(): no verses, '
                  +   'is_loading[ %s => true ], need_scroll[ %s => true ]',
                  String( is_loading ),
                  String( need_scroll ) );
      // */

      is_loading  = true;
      need_scroll = true;
      return;
    }

    /************************************************************************
     * :XXX:
     *    When activating notes, involved DOM elements are tagged with a
     *    'popover-active' attribute. The active notes check scans all
     *    note-related DOM elements within the current container element to see
     *    if all have that attribute. If they do not, then notes have not been
     *    activated.
     *
     *    We use the active notes check as an indication of whether or not
     *    this is the first full rendering of this component.  If notes are
     *    active, rendering has occurred previously, otherwise it has not and:
     *      - notes need to be activated;
     *      - if a verse is selected, we need to scroll to it;
     */
    const notes_active      = notes_are_active( container_el );

    /*
    console.log('ChapterYvers.afterUpdate(): %d verses, '
                +     'notes_active[ %s ], '
                +     'is_selecting[ %s : %s ], verse:',
                verses.length,
                String( notes_active ),
                String( $is_selecting ),
                ($is_selecting ? $selected_store.join(', ') : 'null'),
                verse );
    // */

    if ( ! notes_active ) {
      // Activate notes
      activate_notes( container_el );
    }

    // Ensure selection matches our selection state.
    if (! $is_selecting) {
      remove_selection();

    } else {
      select_verses( $selected_store );

      if ( need_scroll ) {
        // On first full render, scroll the selected verse into view
        scroll_into_view();
      }
    }

    // Update is_loading and need_scroll
    is_loading  = false;
    need_scroll = false;
  });

  /**
   *  Scroll the first of the selected verses into view.
   *
   *  @method scroll_into_view
   */
  function scroll_into_view() {
    const verse_nums  = ($is_selecting && $selected_store);

    // /*
    console.log('ChapterYvers.scroll_into_view(): verse_nums:', verse_nums);
    // */

    if (! Array.isArray( verse_nums) || verse_nums.length < 1) {
      return;
    }

    // Locate all portions of all target verse(s)
    const selector  = `[v="${verse_nums[0]}"]`;
    const first     = container_el.querySelector( selector );

    /*
    console.log('ChapterYvers.scroll_into_view(): first:', first);
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
    console.log('ChapterYvers.reset_selecting(): version_changed[ %s ]:',
                String(version_changed), new_version);
    console.log('ChapterYvers.reset_selecting(): verse_changed[ %s ]:',
                String(verse_changed), new_verse);
    // */

    // Switching to a new version or verse so reset our local state
    selected_store.set( null )

    if (version_changed) {
      version = new_version;

      // When changing versions, reset is_loading and need_scroll
      is_loading  = true;
      need_scroll = true;

    }

    if (verse_changed) {
      verse = new_verse;
    }

    const verse_nums  = (verse && verse.verses);
    if (Array.isArray( verse_nums ) && verse_nums.length > 0) {
      // Update the set of selected verses
      /*
      console.log('ChapterYvers.reset_selecting(): Set selected verses to:',
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
    console.log('ChapterYvers.select_verses(): verse_nums:',
                  verse_nums);
    // */

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
    console.log('ChapterYvers.select_verse( %s ): [ %s ], %d elements ...',
                verse_num,
                selected.join(', '),
                verses.length);
    // */
    verses.forEach( el => {
      el.setAttribute( 'selected', 'true' );
    });

    selected_store.set( selected );

    /* :TODO: Determine if this changes the current URL and, if so,
     *        perform a replaceState() with the new URL.
     */
    const verse = get( verse_store ) || null;
    console.log('ChapterYvers.select_verse( %s ): [ %s ], '
                +   'verse.verses[ %s ], verse.url_ref[ %s ]',
                verse_num,
                selected.join(', '),
                (verse ? verse.verses.join(', ') : '???'),
                (verse ? verse.url_ref           : '???'));
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
    selected.forEach( el => {
      el.removeAttribute( 'selected' );
    });

    // Update 'is_selecting' (on the chapter container)
    selected_store.set( null );

    /* :TODO: Determine if this changes the current URL and, if so,
     *        perform a replaceState() with the new URL.
     */
    const verse = get( verse_store ) || null;
    console.log('ChapterYvers.remove_selection(): %d verse elements, '
                +   'verse.verses[ %s ], verse.url_ref[ %s ]',
                selected.length,
                (verse ? verse.verses.join(', ') : '???'),
                (verse ? verse.url_ref           : '???'));
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
     #
     * :NOTE: Yvers tooltips will *ALWAYS* exist within the DOM but will have
     *        a '.visible' or '.invisible' class according to whether they are
     *        currently presented.
     */
    const toolTips  = document.querySelectorAll( '[role="tooltip"].visible' );
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
    console.log('ChapterYvers.click_verse(): verse_num[ %s ], select[ %s ]:',
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
  };

  /*  Styling }
   *************************************************************************/
</script>

<div class='content yvers { Css.content.join(' ') }'
     selecting={ $is_selecting }
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
