<script>
  import { get } from 'svelte/store';

  import {
    Card,
    Dropdown,
    DropdownItem,
    Label,
    Input,
  } from 'flowbite-svelte';
  import { ChevronDownSolid } from 'flowbite-svelte-icons';

  import { versions, verse }  from '$lib/stores';
  import { set_verse }        from '$lib/verse_ref';

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

  let version       = null;
  let vers_abbr     = null;
  let dropdown_open = false;

  // Initialize version and vers_abbr whenever $versions changes
  $: version   = ($versions && $versions.versions[0]);
  $: vers_abbr = ($versions && $versions.versions[0].abbreviation);

  function dropdown_toggle() {
    dropdown_open = !dropdown_open;
  }

  function dropdown_select( event ) {
    const versions_ro = get( versions );
    const target      = event.target;
    const value       = target.value;
    const new_version = versions_ro.versions[ value ];

    console.log('dropdown_select(): value[ %s ], new_version:',
                value, new_version);

    if (new_version) {
      vers_abbr = new_version.abbreviation;
      version   = new_version;
    }

    dropdown_open = false;
  }

  function item_classes( item, selected ) {
    const classes = CssClass.item.slice();

    /*
    console.log('item_classes(): item.abbreviation[ %s ], selected[ %s ]',
                item.abbreviation, selected);
    // */

    if (item.abbreviation === selected) {
      classes.push( ...CssClass.item_active );
    }

    return classes.join(' ');
  }

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

<div class='flex flex-col w-full h-full py-4'>
  <Card size='md' class='bg-gray-100 dark:bg-gray-900 mx-auto h-full'>
    <div class='flex flex-row w-full mb-4'>
      <button
        id='versions-button'
        type='button'
        class='{ CssClass.button.join(' ') }'
        on:click={ dropdown_toggle }
      >
        { vers_abbr }
        <ChevronDownSolid class='w-3 h-3 ms-2' />
      </button>
      <Dropdown
          open={ dropdown_open }
          class='overflow-y-auto max-h-[50vh] h-full'
          triggeredBy='#versions-button'
      >
       {#each ($versions ? $versions.versions : []) as vers, idex}
        <DropdownItem
            class='{ item_classes( vers, vers_abbr ) }'
            value={ idex }
            on:click={ dropdown_select }
        >
          <div class='flex-grow pointer-events-none'>
            {vers.title}
          </div>
          <div class='text-gray-400 pointer-events-none'>
            {vers.abbreviation}
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
        on:change={  verse_change }
        required
      />
     {/if}
    </div>

    <div class='flex flex-col w-full h-full'>
      { $verse ? `${$verse.ui_ref} [ ${$verse.api_ref} ]`
               : 'Select the desired verse above' }
    </div>
  </Card>
</div>
