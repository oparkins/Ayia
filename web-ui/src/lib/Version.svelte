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
  import { get } from 'svelte/store';

  import {
    BottomNav,
    Card,
  } from 'flowbite-svelte';

  import { goto }                   from  '$app/navigation';
  import { find_book, parse_verse } from '$lib/verse_ref';

  import SelectVersion    from '$lib/SelectVersion.svelte';
  import SelectVerse      from '$lib/SelectVerse.svelte';

  import Chapter          from '$lib/Chapter.svelte';

  import {
    version   as version_stores,
    verse     as verse_store,
  }  from '$lib/stores';

  import Agent  from '$lib/agent';

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
    /*
    console.log('Version.verse: passed-in ...');
    // */

    // Ensure our store is in-sync
    verse_store.set( verse );

  }

  /*  Synchronization }
   *************************************************************************
   *  Local state {
   */
  let need_load       = (content == null);
  let content_loading = false;
  let book            = null;
  let max_chapter     = 0;
  let max_verse       = 0;
  let prev_disabled   = false;
  let next_disabled   = false;

  /*  Local state }
   *************************************************************************
   *  Methods {
   */

  /**
   *  Update dependants once version and verse are available.
   *
   *  @method update_dependents
   *  @param  version   Information about the target version {Object};
   *  @param  verse     Information about the target verse {Object};
   *
   *  Updates:
   *      prev_disabled
   *      next_disabled
   *      book
   */
  function update_dependents( version, verse ) {
    /* Determine immediately if we should disable the previous chapter button.
     *  :XXX: Wait until AFTER the fetch for the next chapter button since
     *        the versions information may not be available yet.
     */
    prev_disabled = (verse.chapter < 2);

    // Check if we have `versions` meta-data to enable bounds checking by book.
    book = find_book( verse.book );
    if (book) {
      // Determine if we should disable the next chapter button
      max_chapter = book.verses.length - 1;
      max_verse   = book.verses[ verse.chapter ];

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
   *  @param  verse     The verse reference {Objecct};
   *                      { book, chapter, verse, ui_ref, api_ref }
   *
   *  This sets the `contoent_loading` flag and, upon completion, the `content`
   *  value.
   *
   *  @return void;
   */
  function fetch_content( version, verse ) {
    if (version == null || verse == null) { return }
    const path  = `/versions/${version.abbreviation}/${verse.api_ref}`;

    if (! need_load) {
      /*
      console.log('Version.fetch_content(): ! need_load');
      // */

      update_dependents( version, verse );

      need_load = true;
      return;
    }

    /*
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

        if (book == null) {
          /* Once this fetch completes, versions meta-data should be available,
           * allowing the use of `find_book()` to retrieve book information.
           */
          update_dependents( version, verse );
        }

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

    if (verse) {
      const path  = `/${ version.abbreviation}/${verse.api_ref}`;
      goto( path );
    }
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
      const path  = `/${ version.abbreviation}/${verse.api_ref}`;
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
    const version = get( version_store );
    const verse   = get( verse_store );

    // assert( version != null );
    // assert( verse   != null );

    const ch_cur    = parseInt( verse.chapter );
    const new_ref   = `${verse.book}.${ch_cur - 1}`;
    const new_verse = parse_verse( new_ref );

    /*
    console.log('Version.chapter_prev(): %s => %s:',
                verse.api_ref, new_ref, new_verse);
    // */

    if (new_verse) {
      const path  = `/${ version.abbreviation}/${new_verse.api_ref}`;
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
    const version = get( version_store );
    const verse   = get( verse_store );

    // assert( version != null );
    // assert( verse   != null );

    const ch_cur    = parseInt( verse.chapter );
    const new_ref   = `${verse.book}.${ch_cur + 1}`;
    const new_verse = parse_verse( new_ref );

    /*
    console.log('Version.chapter_next(): %s => %s:',
                verse.api_ref, new_ref, new_verse);
    // */

    if (new_verse) {
      const path  = `/${ version.abbreviation}/${new_verse.api_ref}`;
      goto( path );
    }
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
      '!p-4',
      '!pb-14',
    ],

    controls: [
      'flex',
      'flex-row',
      'w-full',
      'mb-4',
    ],

    nav_outer: [
      'h-10',
      'bottom-3',

      'border-none',

      'bg-transparent',
      'dark:bg-transparent',
    ],

    nav_inner: [
      'grid-cols-3',
      'p-1',
      'mw-unset',
    ],

    // BottomNav buttons
    nav_button_container: [
      'flex',
      'items-center',
      'justify-center',
    ],

    nav_button: [
      'grow',
      'flex',
      'items-center',
      'px-8',

      'focus:outline-none',

      'text-gray-700',
      'dark:text-gray-300',

      'disabled:opacity-50',
    ],
  };

  /*  Styling }
   *************************************************************************/
</script>

<div class={ Css.container.join(' ') }>
  <Card size='md' class={ Css.card.join(' ') }>
    <div class={ Css.controls.join(' ') }>
      <SelectVersion
          column={ column }
          version={ $version_store }
          on:versionchanged={ version_changed }
      />

     {#if column === 'primary'}
      <SelectVerse
          verse={ $verse_store }
          on:versechanged={ verse_changed }
      />
     {/if}
    </div>

    <Chapter
        is_loading={  content_loading }
        version={     $version_store }
        book={        book }
        verse={       $verse_store }
        content={     content }
    />

   {#if column === 'primary'}
    <BottomNav
        position='fixed'
        navType='application'
        classOuter='{ Css.nav_outer.join(' ') }'
        classInner='{ Css.nav_inner.join(' ') }'>
      <div class='col-span-1 { Css.nav_button_container.join(' ') }'>
        <button
            type='button'
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
        </button>
      </div>
      <div class='col-span-1 { Css.nav_button_container.join(' ') }'>
        <!-- { $verse_store ? $verse_store.ui_ref : '' } -->
      </div>
      <div class='col-span-1 { Css.nav_button_container.join(' ') }'>
        <button
            type='button'
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
        </button>
      </div>
    </BottomNav>
   {/if}
  </Card>
</div>
