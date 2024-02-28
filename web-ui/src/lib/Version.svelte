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
</script>

<div class='flex flex-col w-full h-full py-4 overflow-hidden'>
  <Card size='md' class='bg-gray-100 dark:bg-gray-900 mx-auto h-full'>
    <div class='flex flex-row w-full mb-4'>
      <SelectVersion column={ column } />

     {#if column === 'primary'}
      <SelectVerse />
     {/if}
    </div>

    <div class='flex flex-col w-full h-full overflow-y-auto'>
      {#if content_loading}
        Loading { $verse_store.ui_ref } ...
      {:else if content}
        {#each Object.entries(content.verses) as [label,verse]}
          <div>
            {label}: {verse.text}
          </div>
        {/each}
      {:else if $verse_store}
        { $verse_store.ui_ref } [ { $verse_store.api_ref } ]
      {:else}
        Select the desired verse above
      {/if}
    </div>
  </Card>
</div>
