<script>
  import { onMount, onDestroy } from 'svelte';

  import { derived } from 'svelte/store';

  import { Card } from 'flowbite-svelte';

  import SelectVersion  from '$lib/SelectVersion.svelte';
  import SelectVerse    from '$lib/SelectVerse.svelte';

  import VerseText      from '$lib/VerseText.svelte';
  import VerseYvers     from '$lib/VerseYvers.svelte';

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

  // When either `version` or `verse_store` change, update content
  $: fetch_content( $version, $verse_store );

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

    switch( version.type ) {
      case 'yvers':
        verse_el = VerseYvers;
        break;

      /*
      case 'interlinear':
        verse_el = VerseInterlinear;
        break;
      // */

      default:
        verse_el = VerseText;
        break;
    }

    content_loading = true;
    Agent.get( path )
      .then( res => {
        console.log('fetch_content():', res);

        content = res;
      })
      .catch( err => {
        console.error('fetch_content():', err);
      })
      .finally( () => {
        content_loading = false;
      });
  }

  function click_verse( event ) {
    console.log('Version.click_verse:', event);
  }

  const CssClass  = {
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
  };
</script>

<div class={ CssClass.container.join(' ') }>
  <Card size='md' class={ CssClass.card.join(' ') }>
    <div class={ CssClass.controls.join(' ') }>
      <SelectVersion column={ column } />

     {#if column === 'primary'}
      <SelectVerse />
     {/if}
    </div>

    <div class='chapter { CssClass.body.join(' ') }'>
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
  </Card>
</div>
