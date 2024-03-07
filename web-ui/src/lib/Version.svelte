<script>
  import { get } from 'svelte/store';

  import {
    BottomNav,
    Card,
  } from 'flowbite-svelte';

  import {
    CaretLeftSolid,
    CaretRightSolid,
  } from 'flowbite-svelte-icons';

  import { find_book, set_verse }  from '$lib/verse_ref';

  import SelectVersion  from '$lib/SelectVersion.svelte';
  import SelectVerse    from '$lib/SelectVerse.svelte';

  import VerseText      from '$lib/VerseText.svelte';
  import VerseYvers     from '$lib/VerseYvers.svelte';
  import VerseInterlinear     from '$lib/VerseInterlinear.svelte';


  import {
    version   as version_stores,
    verse     as verse_store,
  }  from '$lib/stores';

  import Agent  from '$lib/agent';

  /* The column containing this component:
   *  - primary : primary column
   *  - column# : secondary column (by number)    :TODO:
   *
   * This determines which store value is used for the version selection and
   * whether a verse selector is included.
   */
  export let column   = 'primary';
  export let version  = null;   // The target version
  export let verse    = null;   // The target verse
  export let content  = null;   // Verse-related content

  /*************************************************************************/
  const version_store = version_stores[ column ];
  if (version_store == null) {
    throw new Error(`Invalid column [ ${column} ]`);
  }

  if (version) {
    console.log('Version.version: passed-in ...');

    // Ensure our store is in-sync
    version_store.set( version );

  } else {
    /* Alias for this component:
     *    primary : primary column
     *    column# : secondary column (by number)
     */
    console.log('Version.version: from-store ...');
  }

  if (verse) {
    console.log('Version.verse: passed-in ...');

    // Ensure our store is in-sync
    verse_store.set( verse );

  } else {
    console.log('Version.verse: from-store ...');

  }

  /*************************************************************************/
  let need_load       = (content == null);
  let content_loading = false;
  let verse_el        = VerseText;
  let book            = null;
  let max_chapter     = 0;
  let max_verse       = 0;
  let prev_disabled   = false;
  let next_disabled   = false;

  // Styling for various components
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

    body: [
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

  /**
   *  Update dependants once version and verse are available.
   *
   *  @method update_dependants
   *  @param  version   Information about the target version {Object};
   *  @param  verse     Information about the target verse {Object};
   *
   *  Updates:
   *      prev_disabled
   *      next_disabled
   *      verse_el
   *      book
   */
  function update_dependants( version, verse ) {
    /* Determine immediately if we should disable the previous chapter button.
     *  :XXX: Wait until AFTER the fetch for the next chapter button since
     *        the versions information may not be available yet.
     */
    prev_disabled = (verse.chapter < 2);

    switch( version.type ) {
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

    // Check if we have `versions` meta-data to enable bounds checking by book.
    book = find_book( verse.book );
    console.log('update_dependants(): book[ %s ]:', verse.book, book);
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

    if (! need_load) {
      console.log('Version.fetch_content(): ! need_load');

      update_dependants( version, verse );

      need_load = true;
      return;
    }

    const path  = `/versions/${version.abbreviation}/${verse.api_ref}`;

    console.log('Version.fetch_content(): path:', path);

    /* Determine immediately if we should disable the previous chapter button.
     *  :XXX: Wait until AFTER the fetch for the next chapter button since
     *        the versions information may not be available yet.
     */
    update_dependants( version, verse );

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
          update_dependants( version, verse );
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
   *  Handle a click on a previous chapter button.
   *
   *  @method chapter_prev
   *  @param  event     The triggering event {Event};
   *
   *  @return void
   */
  function chapter_prev( event ) {
    const verse = get( verse_store );

    /*
    console.log('Version.chapter_prev():', verse);
    // */

    const ch_num          = parseInt( verse.chapter ) - 1;
    let   new_ref         = `${verse.book}.${ch_num}`;
    if (verse.verse && verse.verse !== '') {
      new_ref = `${new_ref}:${verse.verse}`;
    }
    set_verse( new_ref );

    fetch_content( $version_store, $verse_store );
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
    const verse = get( verse_store );

    /*
    console.log('Version.chapter_next():', verse);
    // */

    const ch_num          = parseInt( verse.chapter ) + 1;
    let   new_ref         = `${verse.book}.${ch_num}`;
    if (verse.verse && verse.verse !== '') {
      new_ref = `${new_ref}:${verse.verse}`;
    }

    set_verse( new_ref );

    fetch_content( $version_store, $verse_store );
  }

  // When either `version_store` or `verse_store` change, update content
  $: fetch_content( $version_store, $verse_store );
</script>

<div class={ Css.container.join(' ') }>
  <Card size='md' class={ Css.card.join(' ') }>
    <div class={ Css.controls.join(' ') }>
      <SelectVersion column={ column } />

     {#if column === 'primary'}
      <SelectVerse />
     {/if}
    </div>

    <div class='content { Css.body.join(' ') }'>
      {#if content_loading}
        Loading { $verse_store.ui_ref } ...
      {:else if content}
        {#if (book && $verse_store) }
          <div class='chapter header'>
            <span class='chapter name'>{ book.name }</span>
            <span class='chapter number'>{ $verse_store.chapter }</span>
          </div>
        {/if}

        {#each Object.entries(content.verses) as [verse_ref, verse]}
          <svelte:component
              this={      verse_el }
              verse_ref={ verse_ref }
              verse={     verse }
          />
        {/each}
      {:else if $verse_store}
        { $verse_store.ui_ref } [ { $verse_store.api_ref } ]
      {:else}
        Select the desired verse above
      {/if}
    </div>

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
