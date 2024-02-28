<script>
  import { get, writable, derived } from 'svelte/store';

  import {
    Card,
    Dropdown,
    DropdownItem,
    Label,
    Input,
  } from 'flowbite-svelte';
  import { ChevronDownSolid } from 'flowbite-svelte-icons';

  import { versions, primary_version, verse }  from '$lib/stores';

  import { set_verse }  from '$lib/verse_ref';
  import Agent          from '$lib/agent';

  // Is this the primary verse which all others follow?
  export let primary  = true;

  // CSS Class values for elements
  const CssClass = {
    button: [
      'flex',
      'justify-between',
      'items-center',

      'z-10',
      'py-2.5',
      'px-4',
      'text-sm',
      'font-medium',
      'text-center',
      'text-gray-500',
      'bg-gray-100',
      'border',
      'border-gray-300',
      'hover:bg-gray-200',
      'focus:ring-4',
      'focus:outline-none',
      'focus:ring-gray-100',
      'dark:bg-gray-700',
      'dark:hover:bg-gray-600',
      'dark:focus:ring-gray-700',
      'dark:text-white',
      'dark:border-gray-600',

      'w-32',
    ],

    input: [
      'flex-grow',
      'z-10',
      'inline-flex',
      'text-gray-500',
      'bg-gray-100',
      'border',
      'border-gray-300',
      'hover:bg-gray-200',
      'focus:ring-4',
      'focus:outline-none',
      'focus:ring-gray-100',
      'dark:bg-gray-700',
      'dark:hover:bg-gray-600',
      'dark:focus:ring-gray-700',
      'dark:text-white',
      'dark:border-gray-600',
      'rounded-s-none',
      'rounded-e-lg',
    ],

    item: [
      'flex',
      'gap-x-4',
      'items-center',
      'font-medium',
    ],

    item_active: [
      'font-bold',

      'text-white',

      'bg-gray-200',
      'hover:bg-gray-100',

      'dark:bg-gray-600',
      'dark:hover:bg-bgray-600',
    ],

  };

  let verse_input     = ($verse_ref && $verse_ref.ui_ref || '');
  let dropdown_open   = false;
  let content         = null;
  let content_loading = false;

  /* Alias for this component:
   *    primary : primary column
   *    column# : secondary column (by number)    :TODO:
   */
  const version = primary_version;

  // Derive local state from store
  const vers_abbr = derived( version, ($version) => {
    return ( $version && $version.local_abbreviation );
  });
  const verse_ref = derived( verse, ($verse) => {
    verse_input = ( $verse && $verse.ui_ref );
    return verse_input;
  });

  // When either `version` or `verse` change, update content
  $: fetch_content( $version, $verse );

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

  /**
   *  Toggle the drop-down open value.
   *
   *  @method dropdown_toggle
   *
   *  Toggles the `dropdown_open` state.
   *
   *  @return void
   */
  function dropdown_toggle() {
    dropdown_open = !dropdown_open;
  }

  /**
   *  Handle a select event within the drop-down.
   *
   *  @method dropdown_select
   *  @param  event   The triggering event {PointerEvent};
   *
   *  Updates:
   *    - version
   *    - dropdown_open = false
   *
   *  @return void
   */
  function dropdown_select( event ) {
    const versions_ro = get( versions );
    const target      = event.target;
    const value       = target.value;
    const new_version = versions_ro.versions[ value ];

    console.log('dropdown_select(): value[ %s ], new_version:',
                value, new_version);

    if (new_version) {
      version.set( new_version );
    }

    dropdown_open = false;
  }

  /**
   *  Return the CSS classes for a drop-down item based upon whether the item
   *  value is the currently selected value.
   *
   *  @method item_classes
   *  @param  item      The current item {Object};
   *  @param  selected  The currently selected item {String};
   *
   *  @return The set of CSS classes {String};
   */
  function item_classes( item, selected ) {
    const classes = CssClass.item.slice();

    /*
    console.log('item_classes(): item.abbreviation[ %s / %s ], selected[ %s ]',
                item.local_abbreviation, item.abbreviation, selected);
    // */

    if (item.local_abbreviation === selected) {
      classes.push( ...CssClass.item_active );
    }

    return classes.join(' ');
  }

  /**
   *  Handle a change to the verse input.
   *
   *  @method verse_change
   *  @param  event   The triggering event {Event};
   *
   *  Invokes `verse_ref:set_verse()` with the new input value.
   *
   *  @return void
   */
  function verse_change( event ) {
    const target    = event.target;
    const new_verse = target.value;

    /*
    const verse_ro  = get( verse );
    const cur_verse = (verse_ro
                          ? `${verse_ro.book} `
                              + `${verse_ro.chapter}:${verse_ro.verse}`
                          : 'unset');
    console.log('verse_change(): %s => %s', cur_verse, new_verse);
    // */

    set_verse( new_verse );
  }

  /* Update the classes for the dropdown button based upon whether this is the
   * primary Verse element.
   */
  if (primary) {
    // No grow, no rounded border on the end side of the button
    CssClass.button.push( 'flex-shrink-0', 'rounded-s-lg' );
  } else {
    // Grow, Rounded border all around
    CssClass.button.push( 'flex-grow', 'rounded-lg' );
  }
</script>

<div class='flex flex-col w-full h-full py-4 overflow-hidden'>
  <Card size='md' class='bg-gray-100 dark:bg-gray-900 mx-auto h-full'>
    <div class='flex flex-row w-full mb-4'>
      <button
        id='versions-button'
        type='button'
        class='{ CssClass.button.join(' ') }'
        on:click={ dropdown_toggle }
      >
        { $vers_abbr }
        <ChevronDownSolid class='w-3 h-3 ms-2' />
      </button>
      <Dropdown
          open={ dropdown_open }
          class='overflow-y-auto max-h-[50vh] h-full'
          triggeredBy='#versions-button'
      >
       {#each ($versions ? $versions.versions : []) as vers, idex}
        <DropdownItem
            class='{ item_classes( vers, $vers_abbr ) }'
            value={ idex }
            on:click={ dropdown_select }
        >
          <div class='flex-grow pointer-events-none'>
            {vers.title}
          </div>
          <div class='text-gray-400 pointer-events-none'>
            {vers.local_abbreviation}
          </div>
        </DropdownItem>
       {/each}
      </Dropdown>

     {#if primary}
      <Input
        id='verse'
        type='text'
        placeholder='Verse'
        class='{ CssClass.input.join(' ') }'
        bind:value={ verse_input }
        on:change={  verse_change }
        required
      />
     {/if}
    </div>

    <div class='flex flex-col w-full h-full overflow-y-auto'>
      {#if content_loading}
        Loading { $verse.ui_ref } ...
      {:else if content}
        {#each Object.entries(content.verses) as [label,verse]}
          <div>
            {label}: {verse.text}
          </div>
        {/each}
      {:else if $verse}
        { $verse.ui_ref } [ { $verse.api_ref } ]
      {:else}
        Select the desired verse above
      {/if}
    </div>
  </Card>
</div>
