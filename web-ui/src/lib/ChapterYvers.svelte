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
   *  @prop     verse         The target verse, via `parse_verse()`
   *                          {VerseRef};
   *                            { book      : Extracted book name {String},
   *                              chapter   : Extracted chapter {Number},
   *                              verse     : First extracted verse {Number},
   *                              verses    : Full set of referenced verses
   *                                          {Array};
   *                              full_book : Full book information {Object};
   *                              ui_ref    : A UI representation of this
   *                                          reference {String};
   *                              url_ref   : A URL representation of this
   *                                          reference {String};
   *                            }
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
    show_footnotes,
    show_xrefs,
    show_redletters,

    version   as version_stores,
    verse     as verse_store,
    selected  as selected_store,
  }  from '$lib/stores';

  import { html_chapter }                 from '$lib/render/yvers';
  import { activate  as activate_notes }  from '$lib/verse_note';

  /*  Imports }
   *************************************************************************
   *  Local state/methods {
   */
  let container_el  = null;
  let activated     = false;

  const version_store = version_stores[ column ];
  const is_selecting  = derived( selected_store, ( $selected_store ) => {
    return (Array.isArray( $selected_store ) && $selected_store.length > 0);
  });

  // As soon as this component has been updated, activate all popovers
  afterUpdate(async () => {
    /*
    console.log('ChapterYvers.afterUpdate(): '
                +     'activated[ %s ], is_selecting[ %s : %s ], verse:',
                String( activated ),
                String( $is_selecting ),
                ($is_selecting ? $selected_store.join(', ') : 'null'),
                verse );
    // */

    /* New target verse -- activate notes and, if a verse number was
     * requested, select and scroll.
     */
    if (! $is_selecting) {
      remove_selection();
    }

    const notes       = activate_notes( container_el );
    const verse_nums  = ($is_selecting ? $selected_store : null);
    if (Array.isArray( verse_nums ) && verse_nums.length > 0) {
      // Locate all portions of all target verse(s)
      const selector  = verse_nums.map( num => `[v="${num}"]` ).join(',');
      const verses    = container_el.querySelectorAll( selector );
      const first     = verses.item( 0 );

      if (verses.length > 0) {
        /*
        console.log('ChapterYvers.afterUpdate(): verse_nums,verses:',
                    verse_nums, verses);
        // */

        // Select all portions of the target verse(s)
        verse_nums.forEach( num => select_verse( num, verses ) );
      }

      if (first) {
        /*
        console.log('ChapterYvers.afterUpdate(): scrollIntoView:', first);
        // */

        // Scroll the first of the target verse(s) into view
        first.scrollIntoView({ behavior: 'auto', block: 'center'});

        activated = true;
      }

    } else if (notes.length > 0) {
      activated = true;
    }

    /*
    if (activated) {
      console.log('ChapterYvers.afterUpdate(): notes:', notes);
    }
    // */
  });

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

    /*
    console.log('reset_selecting(): version/new:', version, new_version);
    console.log('reset_selecting(): verse/new  :', verse, new_verse);
    console.log('reset_selecting(): activated[ %s ], is_selecting[ %s : %s ]',
                String(activated),
                String($is_selecting),
                ($is_selecting ? $selected_store.join(', ') : 'null') );
    // */

    // Switching to a new version or verse so reset our local state
    selected_store.set( null )
    activated = false;

    if (version !== new_version) {
      version = new_version;
    }
    if (verse !== new_verse) {
      verse = new_verse;
    }

    const verse_nums  = (verse && verse.verses);
    if (Array.isArray( verse_nums ) && verse_nums.length > 0) {
      // Update the set of selected verses
      console.log('reset_selecting(): Update selected verses to:',
                  verse_nums.join(', '));

      selected_store.set( verse_nums );
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

      'border-b',
      'border-gray-200',
      'dark:border-gray-600',
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
