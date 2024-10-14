<script>
  /**
   *  Present version-related content based upon the selected version and
   *  verse.
   *
   *  @element  Version
   *  @prop     [version = null]      The current version {Version};
   *  @prop     [verse = null]        The target verse {Object};
   *  @prop     [content = null]      Content for the current `version` and
   *                                  `verse` {Object};
   *  @prop     [column = 'primary']  The column this selector is for
   *                                  (primary | column#) {String};
   *                                  For the 'primary' column, style with no
   *                                  end-side rounded border to allow snugging
   *                                  up against a companion SelectVerse
   *                                  element.
   *
   *  External properties {
   */
  export let column   = 'primary';
  export let version  = null;   // The target version
  export let verse    = null;   // The target verse
  export let content  = null;   // Verse-related content

  /*  External properties }
   *************************************************************************
   *  Imports {
   *
   */
  import { get, derived } from 'svelte/store';

  import {
    BottomNav,
    Button,
    Card,
  } from 'flowbite-svelte';

  import { goto } from  '$app/navigation';

  import { find_book, VerseRef, ref_num } from '$lib/verse_ref';

  import SelectVersion    from '$lib/SelectVersion.svelte';
  import SelectVerse      from '$lib/SelectVerse.svelte';

  import Chapter          from '$lib/Chapter.svelte';
  import ChapterYvers     from '$lib/ChapterYvers.svelte';

  import {
    versions  as versions_store,
    version   as version_stores,
    verse     as verse_store,
    selected  as selected_store,
  }  from '$lib/stores';

  import Agent  from '$lib/agent';

  import { DotsVerticalOutline as DotsVertical } from 'flowbite-svelte-icons';

  /*  Imports }
   *************************************************************************
   *  Synchronization {
   *
   *  Establish context from properties and/or stores.
   */
  const version_store = version_stores[ column ];
  if (version_store == null) {
    throw new Error(`Invalid column [ ${column} ]`);
  }

  // Synchronize our store with any incoming parameters
  if (version) {
    /*
    console.log('Version.version: passed-in ...');
    // */

    // Ensure our store is in-sync
    version_store.set( version );
  }

  if (verse) {
    // /*
    console.log('Version.verse: passed-in, update verse_store:', verse);
    // */

    // Ensure our store is in-sync
    verse_store.set( verse );

  }

  /*  Synchronization }
   *************************************************************************
   *  Local state {
   */
  let content_loading = false;
  let chapter_el      = Chapter;
  let book            = null;
  let max_chapter     = 0;
  let max_verse       = 0;
  let prev_disabled   = false;
  let next_disabled   = false;

  const is_selecting  = derived( selected_store, ( $selected_store ) => {
    return (Array.isArray( $selected_store ) && $selected_store.length > 0);
  });

  /*  Local state }
   *************************************************************************
   *  Methods {
   */

  /**
   *  Update dependants once version and verse are available.
   *
   *  @method update_dependents
   *  @param  version   Information about the target version {Object};
   *  @param  verse     Information about the target verse {VerseRef};
   *
   *  Updates:
   *      prev_disabled
   *      next_disabled
   *      book
   */
  function update_dependents( version, verse ) {
    const versions  = get( versions_store );

    // Determine which Chapter element we should use
    if (version && (version.type === 'yvers' || version.type === 'pdf')) {
      chapter_el = ChapterYvers;

    } else {
      chapter_el = Chapter;
    }

    /* Determine immediately if we should disable the previous chapter button.
     *  :XXX: Wait until AFTER the fetch for the next chapter button since
     *        the versions information may not be available yet.
     */
    prev_disabled = (verse.chapter < 2);

    if (verse.book) {
      // Determine if we should disable the next chapter button
      max_chapter = verse.book.verses.length - 1;
      max_verse   = verse.book.verses[ verse.chapter ];

      next_disabled = (verse.chapter >= max_chapter);

    } else {
      next_disabled = false;
    }
  }

  /**
   *  Fetch content based upon the current `vers_abbr` and parsed `verse`.
   *
   *  @method fetch_content
   *  @param  version   The selected version {Object};
   *                      { abbreviation, local_abbreviation, ... }
   *  @param  verse     The verse reference {VerseRef};
   *
   *  This sets the `contoent_loading` flag and, upon completion, the `content`
   *  value.
   *
   *  @return void;
   */
  function fetch_content( version, verse ) {
    if (content_loading) { return }

    if (version == null || verse == null || verse.is_valid !== true) {
      return;
    }
    //const path  = `/versions/${version.abbreviation}/${verse.url_ref}`;

    /* :XXX: Don't use `verse.url_ref` directly since we really want to
     *       ensure we fetch an entire chapter.
     */
    const api_ref = `${verse.book.abbr}.${ref_num(verse.chapter)}`;
    const path    = `/versions/${version.abbreviation}/${api_ref}`;

    // /*
    console.log('Version.fetch_content(): path:', path);
    // */

    /* Determine immediately if we should disable the previous chapter button.
     *  :XXX: Wait until AFTER the fetch for the next chapter button since
     *        the versions information may not be available yet.
     */
    update_dependents( version, verse );

    content_loading = true;
    Agent.get( path )
      .then( res => {
        /*
        console.log('fetch_content():', res);
        // */

        /* Once this fetch completes, versions meta-data should be available,
         * allowing the use of `find_book()` to retrieve book information.
         */
        update_dependents( version, verse );

        content = res;
      })
      .catch( err => {
        console.error('fetch_content():', err);
      })
      .finally( () => {
        content_loading = false;
      });
  }

  /**
   *  Handle a 'versionchanged' event from SelectVersion
   *
   *  @method version_changed
   *  @param  event         The triggering event {CustomEvent};
   *  @param  event.type    The event type (selected) {String};
   *  @param  event.detail  The selected version {Version};
   *
   *  @return void
   */
  function version_changed( event ) {
    const version = event.detail;

    // assert( event.type === 'versionchanged' );
    // assert( version != null && typeof(version) === 'object' );

    const verse = get( verse_store );
    // assert( version != null );
    // assert( verse   != null );

    let path  = `/${ version.abbreviation}`;
    if (verse) {
      // Redirect to the full version/verse
      path  += `/${verse.url_ref}`;
    }

    goto( path );
  }

  /**
   *  Handle a 'versechanged' event from SelectVerse
   *
   *  @method verse_changed
   *  @param  event         The triggering event {CustomEvent};
   *  @param  event.type    The event type (selected) {String};
   *  @param  event.detail  The selected version {Version};
   *
   *  @return void
   */
  function verse_changed( event ) {
    const verse = event.detail;

    // assert( event.type === 'versechanged' );
    // assert( verse != null && typeof(verse) === 'object' );

    const version = get( version_store );
    // assert( version != null );
    // assert( verse   != null );

    if (version) {
      const path  = `/${ version.abbreviation}/${verse.url_ref}`;
      goto( path );
    }
  }

  /**
   *  Handle a click on a previous chapter button.
   *
   *  @method chapter_prev
   *  @param  event     The triggering event {Event};
   *
   *  @return void
   */
  function chapter_prev( event ) {
    const versions  = get( versions_store );
    const version   = get( version_store );
    const verse     = get( verse_store );

    // assert( version != null );
    // assert( verse   != null );

    const ch_cur    = parseInt( verse.chapter );
    const new_ref   = `${verse.book}.${ch_cur - 1}`;
    const new_verse = new VerseRef( new_ref, versions );

    /*
    console.log('Version.chapter_prev(): %s => %s:',
                verse.url_ref, new_ref, new_verse);
    // */

    if (new_verse && new_verse.is_valid) {
      const path  = `/${ version.abbreviation}/${new_verse.url_ref}`;
      goto( path );
    }
  }

  /**
   *  Handle a click on a next chapter button.
   *
   *  @method chapter_next
   *  @param  event     The triggering event {Event};
   *
   *  @return void
   */
  function chapter_next( event ) {
    const versions  = get( versions_store );
    const version   = get( version_store );
    const verse     = get( verse_store );

    // assert( version != null );
    // assert( verse   != null );

    const ch_cur    = parseInt( verse.chapter );
    const new_ref   = `${verse.book}.${ch_cur + 1}`;
    const new_verse = new VerseRef( new_ref, versions );

    /*
    console.log('Version.chapter_next(): %s => %s:',
                verse.url_ref, new_ref, new_verse);
    // */

    if (new_verse && new_verse.is_valid) {
      const path  = `/${ version.abbreviation}/${new_verse.url_ref}`;
      goto( path );
    }
  }

  /**
   *  Handle a click on a more options button.
   *
   *  @method more_options
   *  @param  event     The triggering event {Event};
   *
   *  @return void
   */
  function more_options( event ) {
    // /*
    console.log('Version.more_options():', event);
    // */
  }

  // When either `version_store` or `verse_store` change, update content
  $: fetch_content( $version_store, $verse_store );

  /*  Methods }
   *************************************************************************
   *  Styling {
   */
  const Css = {
    container: [
      'flex',
      'flex-col',
      'w-full',
      'h-full',
      'overflow-hidden',
    ],

    card: [
      'bg-gray-100',
      'dark:bg-gray-900',
      'mx-auto',
      'h-full',

      '!pe-0',
      '!pb-16',

      'max-w-[100vw]',

      'rounded-none',
      'border-x-0',

      /* On medium screen (> 768px), limit the width, round the corners and
       * include left/right borders.
       */
      'md:max-w-prose',
      'md:rounded-lg',
      'md:border-x',
    ],

    nav_outer: [
      //'h-10',
      //'bottom-3',

      'pb-[1px]',     // Leave room for the bottom border
      'border-none',

      'bg-transparent',
      'dark:bg-transparent',
    ],

    nav_inner: [
      'grid-cols-7',
      'gap-2',
      'p-1',
      'mw-unset',

      /* Increase the max width slightly from max-w-lg (32rem) to provide
       * just a bit more border to extend beyond the text above.
       */
      'max-w-[33rem]',

      // Background to cover gaps
      'bg-gray-100',
      'dark:bg-gray-900',

      // Top border here instead of bottom border on
      'border-t',
      'border-gray-200',
      'dark:border-gray-600',
    ],

    // BottomNav buttons
    nav_button_container: [
      'col-span-1',
      'flex',
      'items-center',
      'justify-center',
    ],

    nav_button: [
      'w-full',
      'flex',
      'items-center',
      'p-2',

      'focus:ring-1',
      'focus:outline-none',

      'text-gray-500',
      'bg-gray-100',
      'hover:bg-gray-200',
      'hover:text-black',
      'focus:ring-blue-500',

      'dark:text-gray-500',
      'dark:bg-gray-900',
      'dark:hover:bg-gray-800',
      'dark:hover:text-white',
      'dark:focus:ring-blue-500',

      'disabled:opacity-50',
      'disabled:hover:text-gray-500',
      'disabled:hover:bg-gray-100',
      'disabled:dark:hover:text-gray-500',
      'disabled:dark:hover:bg-gray-900',
    ],
  };

  /*  Styling }
   *************************************************************************/
</script>

<div class={ Css.container.join(' ') }>
  <Card class={ Css.card.join(' ') }>
    <svelte:component
        this={        chapter_el }
        is_loading={  content_loading }
        column={      column }
        version={     $version_store }
        book={        book }
        verse={       $verse_store }
        content={     content }
    />

    <BottomNav
        position='absolute'
        classOuter='{ Css.nav_outer.join(' ') }'
        classInner='{ Css.nav_inner.join(' ') }'>
      <div class='justify-start { Css.nav_button_container.join(' ') }'>
       {#if column === 'primary'}
        <Button
            pill={ true }
            disabled={ prev_disabled }
            on:click={ chapter_prev }
            class='{ Css.nav_button.join(' ') } justify-start'>
          <svg  aria-hidden='true'
                class='w-5 h-5 sm:w-6 sm:h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'>
            <path stroke-linecap='round'
                  stroke-linejoin='round'
                  stroke-width='2'
                  d='M15 19l-7-7 7-7' />
          </svg>
        </Button>
       {/if}
      </div>
      <div class='{ Css.nav_button_container.join(' ') }'>
       {#if column === 'primary'}
        <SelectVersion
            column={ column }
            version={ $version_store }
            on:versionchanged={ version_changed }
        />
       {/if}
      </div>
      <div class='{ Css.nav_button_container.join(' ') } col-span-3'>
       {#if column === 'primary'}
        <SelectVerse
            verse={ $verse_store }
            on:versechanged={ verse_changed }
        />
       {:else}
        <SelectVersion
            column={ column }
            version={ $version_store }
            on:versionchanged={ version_changed }
        />
       {/if}
      </div>
      <div class='{ Css.nav_button_container.join(' ') }'>
       {#if column === 'primary'}
        <Button
            disabled={ ! $is_selecting }
            on:click={ more_options }
            class='{ Css.nav_button.join(' ') }'>
          <DotsVertical class='pointer-events-none' />
        </Button>
       {/if}
      </div>
      <div class='justify-end { Css.nav_button_container.join(' ') }'>
       {#if column === 'primary'}
        <Button
            pill={ true }
            disabled={ next_disabled }
            on:click={ chapter_next }
            class='{ Css.nav_button.join(' ') } justify-end'>
          <svg  aria-hidden='true'
                class='w-5 h-5 sm:w-6 sm:h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'>
            <path stroke-linecap='round'
                  stroke-linejoin='round'
                  stroke-width='2'
                  d='M9 5l7 7-7 7' />
          </svg>
        </Button>
       {/if}
      </div>
    </BottomNav>
  </Card>
</div>
