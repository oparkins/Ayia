<script>
  import { onMount, onDestroy } from 'svelte';

  import { get, derived } from 'svelte/store';

  import {
    BottomNav,
    BottomNavItem,
    Tooltip,
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
    version   as version_store,
    verse     as verse_store,
  }  from '$lib/stores';

  import Agent  from '$lib/agent';

  /* The column this selector is for:
   *  - primary : primary column
   *  - column# : secondary column (by number)    :TODO:
   *
   * This determines which store value is used for the version selection and
   * whether a verse selector is included.
   */
  export let column = 'primary';

  /*************************************************************************/
  /* Alias for this component:
   *    primary : primary column
   *    column# : secondary column (by number)
   */
  const version = version_store[ column ];

  if (version == null) {
    throw new Error(`Invalid column [ ${column} ]`);
  }

  let content         = null;
  let content_loading = false;
  let verse_el        = VerseText;
  let book            = null;
  let max_chapter     = 0;
  let max_verse       = 0;
  let prev_disabled   = false;
  let next_disabled   = false;

  // When either `version` or `verse_store` change, update content
  $: fetch_content( $version, $verse_store );

  // Styling for various components
  const Css = {
    container: [
      'flex',
      'flex-col',
      'w-full',
      'h-full',
      'py-4',
      'overflow-hidden',
    ],

    card: [
      'bg-gray-100',
      'dark:bg-gray-900',
      'mx-auto',
      'h-full',
      '!p-4',
      '!pb-0',
    ],

    controls: [
      'flex',
      'flex-row',
      'w-full',
      'mb-4',
    ],

    body: [
      //'flex',
      //'flex-col',
      'w-full',
      'h-full',
      'overflow-y-auto',
      'text-gray-800',
      'dark:text-gray-200',
    ],

    nav_outer: [
      'h-10',

      'bg-transparent',
      'dark:bg-transparent',
    ],

    nav_inner: [
      'grid-cols-2',
      'p-1',
      'mw-unset',
    ],

    // BottomNavItem.btnClass
    nav_item: [
      'disabled:bg-transparent',
      'disabled:dark:bg-transparent',
    ],

    nav_icon: [
      'w-5',
      'h-5',

      'text-gray-500',
      'group-hover:text-primary-600',

      'dark:text-gray-400',
      'dark:group-hover:text-primary-500',
    ],

    nav_icon_disabled: [
      'w-5',
      'h-5',
      'opacity-50',

      'text-gray-500',
      'group-hover:text-gray-500',

      'dark:text-gray-400',
      'dark:group-hover:dark:text-gray-400',
    ],
  };

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

    content_loading = true;
    Agent.get( path )
      .then( res => {
        console.log('fetch_content():', res);

        /* Once this fetch completes, versions meta-data should be available,
         * allowing the use of `find_book()` to retrieve book information.
         */
        book = find_book( verse.book );
        if (book) {
          // Determine if we should disable the next chapter button
          max_chapter = book.verses.length - 1;
          max_verse   = book.verses[ verse.chapter ];

          next_disabled = (verse.chapter >= max_chapter);
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
  }

  /**
   *  Retrieve the proper styling for a nav icon based upon `isDisabled`
   *
   *  @method nav_icon_class
   *  @param  isDisabled    Is navigation disabled? {Boolean};
   *
   *  @return The class {String};
   */
  function nav_icon_class( isDisabled ) {
    return (isDisabled
              ? Css.nav_icon_disabled.join(' ')
              : Css.nav_icon.join(' ') );
  }
</script>

<div class={ Css.container.join(' ') }>
  <Card size='md' class={ Css.card.join(' ') }>
    <div class={ Css.controls.join(' ') }>
      <SelectVersion column={ column } />

     {#if column === 'primary'}
      <SelectVerse />
     {/if}
    </div>

    <div class='content { CssClass.body.join(' ') }'>
      {#if content_loading}
        Loading { $verse_store.ui_ref } ...
      {:else if content}
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
        position='sticky'
        navType='card'
        classOuter='{ Css.nav_outer.join(' ') }'
        classInner='{ Css.nav_inner.join(' ') }'>
      <BottomNavItem
          appBtnPosition='left'
          disabled={ prev_disabled }
          on:click={ chapter_prev }
          btnClass='{ Css.nav_item.join(' ') }'
      >
        <CaretLeftSolid class='{ nav_icon_class( prev_disabled ) }' />
        {#if (!prev_disabled)}
        <Tooltip>Previous Chapter</Tooltip>
        {/if}
      </BottomNavItem>
      <BottomNavItem
          appBtnPosition='right'
          disabled={ next_disabled }
          on:click={ chapter_next }
          btnClass='{ Css.nav_item.join(' ') }'
      >
        <CaretRightSolid class='{ nav_icon_class( next_disabled ) }' />
        {#if (!next_disabled)}
        <Tooltip>Next Chapter</Tooltip>
        {/if}
      </BottomNavItem>
    </BottomNav>
   {/if}
  </Card>
</div>
