<script>
  /**
   *  Present the content of a single chapter from a YVERS source within a
   *  controller the provides the target version, book, verse (ref), and
   *  chapter content.
   *
   *  @element  ChapterYvers
   *  @prop     content_loading   Indicates whether `content` is currently
   *                              being loaded {Boolean};
   *  @prop     column            The column in which this chapter is presented
   *                              (primary | column#) {String};
   *  @prop     book              The target book {Book};
   *
   *  Required contexts:
   *    version
   *    verse
   *    content
   *
   *  External properties {
   */
  export let content_loading  = true;
  export let column           = null;   // The column for this chapter
  export let book             = null;   // The target book

  /*  External properties }
   *************************************************************************
   *  Imports {
   *
   */
  import { getContext, afterUpdate, tick }  from 'svelte';
  import { get, writable, derived } from 'svelte/store';
  import scrollIntoView from 'scroll-into-view-if-needed'

  import { goto } from '$app/navigation';

  import {
    show_footnotes,
    show_xrefs,
    show_redletters,

    selected  as selected_store,
  }  from '$lib/stores';

  import { html_chapter }   from '$lib/render/yvers';
  import {
    activate  as activate_notes,
    is_active as notes_are_active,
  }  from '$lib/verse_note';

  const version_stores  = getContext( 'version' );
  const verse_store     = getContext( 'verse' );
  const content_store   = getContext( 'content' );

  /*  Imports }
   *************************************************************************
   *  Local state/methods {
   */
  let   container_el  = null;
  const is_loading    = writable( content_loading || true );

  const version_store = version_stores[ column ];
  const is_selecting  = derived( selected_store, ( $selected_store ) => {
    return (Array.isArray( $selected_store ) && $selected_store.length > 0);
  });

  /**
   *  Triggered whenever $content_store changes, update `is_loading` to true.
   *
   *  @method content_changed
   *  @param  new_content   The (new) content from `$content_store` {String};
   *
   *  @return void
   */
  function content_changed( new_content ) {
    /*
    console.log('ChapterYvers.content_changed(): '
                +     'is_loading[ %s => true ] ...',
                String( $is_loading ) );
    // */

    is_loading.set(  true );
  }

  /**
   *  Scroll the first of the selected verses into view.
   *
   *  @method scroll_into_view
   */
  function scroll_into_view() {
    if (container_el == null) { return }

    const verse_nums  = ($is_selecting && $selected_store);

    /*
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
      const scrollOpts  = {
        //behavior  : 'auto',         // default: auto
        //inline    : 'nearest',      // default: nearest

        block                     : 'center',     // default: center
        scrollMode                : 'if-needed',  // default: always
        skipOverflowHiddenElements: true,         // default: false
        boundary                  : container_el,
      };

      scrollIntoView( first, scrollOpts );
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
    const version_changed = ($version_store !== new_version);
    const verse_changed   = ($verse_store   !== new_verse);

    /*
    console.log('ChapterYvers.reset_selecting(): version_changed[ %s ]:',
                String(version_changed), new_version);
    console.log('ChapterYvers.reset_selecting(): verse_changed[ %s ]:',
                String(verse_changed), new_verse);
    // */

    // Switching to a new version or verse so reset our local state
    selected_store.set( null )

    const verse_nums  = ($verse_store && $verse_store.verses);
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
    console.log('ChapterYvers.select_verse( %s ): [ %s ], %d elements ...',
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
   *  Update the selection attribute of the given verse element.
   *
   *  @method update_selection
   *  @param  $el   The target verse element {Element};
   *
   *  @return void
   */
  function update_selection( $el ) {
    // Identify the verse number and determine if the current verse is selected
    const verse_str = $el.getAttribute('v');
    const select    = (! $el.hasAttribute('selected'));

    /*
    console.log('ChapterYvers.update_selection(): '
                +           'verse_str[ %s ], select[ %s ]:',
                verse_str, String( select ), $el);
    // */

    if (select) {
      // Selet the target verse.
      const verse_num = parseInt( verse_str );

      // assert( ! Number.isNaN( verse_num ) )
      select_verse( verse_num );

    } else {
      // Remove verse selection
      remove_selection();

    }

    // Update the current state with the new selection
    const ref_stored  = get( verse_store );
    ref_stored.update_verses( $selected_store );

    /*
    console.log('ChapterYvers.update_selection(): verse_str[ %s ], '
                +       'select[ %s ], selected[ %s ], verse_ref[ %s ]',
                verse_str, String( select ),
                ($selected_store ? $selected_store.join(', ') : 'none'),
                ref_stored.ui_ref);
    // */

    goto( ref_stored.url_ref, { replaceState: true } );
  }

  /**
   *  Handle a click within the chapter element:
   *  - on a verse: highlight, extend, or remove highlight;
   *  - on a link : navigate to the target href;
   *
   *  @method click_verse
   *  @param  event     The triggering event {Event};
   *
   *  @return void
   */
  function click_verse( event ) {
    const target  = event.target;

    /*
    console.log('ChapterYvers.click_verse(): target:', target);
    // */

    const $xt = target.closest('.xt[target="_self"]');
    if ($xt) {
      // Handle a click on a cross-reference anchor
      const href  = $xt.getAttribute('href');

      /*
      console.log('ChapterYvers.click_verse(): xt.href[ %s ]', href);
      // */

      if (href) {
        event.preventDefault();

        goto( href );
        return;
      }
    }

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

    event.preventDefault();

    update_selection( el );
  }

  /*  Local state/Methods }
   *************************************************************************
   *  Reactivity {
   */

  // Monitor when `$content_store` changes
  $: content_changed( $content_store );

  /* Whenever `$version_store` or `$verse_store` change, trigger
   * reset_selecting()
   */
  $: reset_selecting( $version_store, $verse_store );

  /**
   * As soon as this component has been fully loaded, ensure notes are active,
   * perform any selection update, and if selecting, scroll the first selected
   * verse into view.
   */
  afterUpdate(() => {
    /* :XXX:
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
    const notes_active  = notes_are_active( container_el );

    /*
    const verses        = (container_el
                            ? container_el.querySelectorAll( '[v]' )
                            : []);
    console.log('ChapterYvers.afterUpdate(): %d verses, '
                +     'notes_active[ %s ], '
                +     'is_loading[ %s => false ], '
                +     'is_selecting[ %s : %s ], verse:',
                verses.length,
                String( notes_active ),
                String( $is_loading ),
                String( $is_selecting ),
                ($is_selecting ? $selected_store.join(', ') : 'null'),
                $verse_store );
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

      // Wait a tick and then scroll the selected verse(s) into view.
      tick().then( () => scroll_into_view() );
    }

    // Update is_loading
    is_loading.set(  false );
  });


  /*  Reactivity }
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

<div class='content yvers { Css.content.join(' ') }'
     selecting={ $is_selecting }
      role='presentation'
      on:click={ click_verse }
      bind:this={container_el} >
  {#if $is_loading}
    Loading { $verse_store ? $verse_store.ui_ref : '' } ...
  {/if}
  <div class='body { Css.body.join(' ') }'
       style='{ `display: ${ $is_loading ? 'none' : 'block'}` }'>
    {#if $content_store}
      {#if (book && $verse_store ) }
        <div class='chapter header'>
          <span class='chapter name'>{ book.name }</span>
          <span class='chapter number'>{ $verse_store.chapter }</span>
        </div>
      {/if}
      {@html html_chapter( $content_store,
                            { footnotes : $show_footnotes,
                              xrefs     : $show_xrefs,
                              redletters: $show_redletters } ) }
    {:else if $verse_store}
      Select the desired version below
    {:else}
      Select the desired verse below
    {/if}
  </div>
</div>
