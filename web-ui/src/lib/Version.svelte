<script>
  import { derived } from 'svelte/store';

  import {
    Card,
    Dropdown,
    DropdownItem,
    Label,
    Input,
  } from 'flowbite-svelte';
  import { ChevronDownSolid } from 'flowbite-svelte-icons';

  import SelectVersion  from '$lib/SelectVersion.svelte';
  import SelectVerse    from '$lib/SelectVerse.svelte';
  import Render         from '$lib/render';

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
  let default_render  = ( key, verse ) => {
    return `
      <div class='verse'>
        <span class='ref'>${key}</span>
        <span class='text'>${verse.text}</span>
      </div>
    `
  };
  let render          = default_render;

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
        render = Render.yvers;
        break;

      case 'interlinear':
        render = Render.interlinear;
        break;

      default:
        render = default_render;
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
    ],

    controls: [
      'flex',
      'flex-row',
      'w-full',
      'mb-4',
    ],

    body: [
      'flex',
      'flex-col',
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

    <div class={ CssClass.body.join(' ') }>
      {#if content_loading}
        Loading { $verse_store.ui_ref } ...
      {:else if content}
        {#each Object.entries(content.verses) as [label,verse]}
          {@html render( label, verse )}
        {/each}
      {:else if $verse_store}
        { $verse_store.ui_ref } [ { $verse_store.api_ref } ]
      {:else}
        Select the desired verse above
      {/if}
    </div>
  </Card>
</div>
