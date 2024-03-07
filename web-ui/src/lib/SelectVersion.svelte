<script>
  import { get, derived } from 'svelte/store';

  import {
    Card,
    Dropdown,
    DropdownItem,
    Label,
    Input,
  } from 'flowbite-svelte';
  import { ChevronDownSolid } from 'flowbite-svelte-icons';

  import {
    versions  as versions_store,
    version   as version_store,
  }  from '$lib/stores';

  /* The column this selector is for:
   *  - primary : primary column
   *  - column# : secondary column (by number)    :TODO:
   *
   * This determines which store value is used for the selection
   */
  export let column = 'primary';

  // CSS Class values for elements
  const CssClass = {
    container: [
      'flex',
      'flex-row',
    ],

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
      'border',
      'focus:ring-4',
      'focus:outline-none',
      'w-32',

      'text-gray-500',
      'bg-gray-100',
      'border-gray-300',
      'hover:bg-gray-200',
      'focus:ring-gray-100',

      'dark:bg-gray-700',
      'dark:hover:bg-gray-600',
      'dark:focus:ring-gray-700',
      'dark:text-white',
      'dark:border-gray-600',
    ],

    item: [
      'flex',
      'gap-x-4',
      'items-center',
      'font-medium',
    ],

    item_active: [
      'font-bold',

      'text-black',
      'bg-gray-200',
      'hover:bg-gray-100',

      'dark:text-white',
      'dark:bg-gray-600',
      'dark:hover:bg-bgray-600',
    ],

  };

  /* Update the classes for the dropdown button based upon whether this is the
   * primary Verse element.
   */
  if ( column === 'primary' ) {
    // No grow, no rounded border on the end side of the button
    CssClass.button.push( 'flex-shrink-0', 'rounded-s-lg' );

  } else {
    // Grow, Rounded border all around
    CssClass.button.push( 'flex-grow', 'rounded-lg' );

  }

  /*************************************************************************/
  const version       = version_store[ column ];
  let   dropdown_open = false;
  let   container_el  = null;

  if (version == null) {
    throw new Error(`Invalid column [ ${column} ]`);
  }

  // Derive local state from store
  const versions_sorted = derived( versions_store, ($versions_store) => {
    const versions  = ($versions_store ? $versions_store.versions : []);

    /*
    console.log('SelectVersion(): Sort %d versions ...', versions.length);
    // */

    return versions.sort( (a,b) => {
      return a.title.localeCompare( b.title );
    });
  });

  const vers_abbr = derived( version, ($version) => {
    return ( $version && $version.local_abbreviation );
  });

  /**
   *  Handle a show event from the drop-down.
   *
   *  @method dropdown_show
   *  @param  event         The triggering event {Event};
   *  @param  event.detail  True/showing, False/hidden {Boolean};
   *
   *  IF there is an active item, scroll it into view.
   *
   *  @return void
   */
  function dropdown_show( event ) {
    const isOpen  = (event.detail);

    if (! isOpen) { return }

    // Wait a tick for the dropdown to be rendered
    setTimeout( () => {
      // Locate the currently active element
      const active_el = (container_el
                          ? container_el.querySelector('[active="true"]')
                          : null);

      if (active_el) {
        // Scroll the active element into view
        if (active_el.scrollIntoViewIfNeeded) {
          // A+ class browsers
          active_el.scrollIntoViewIfNeeded();
        } else {
          // Firefox
          active_el.scrollIntoView({block:'center'});
        }
      }
    }, 0);
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
    const versions_ro = get( versions_sorted );
    const target      = event.target;
    const value       = target.value;
    const new_version = versions_ro[ value ];

    console.log('dropdown_select(): value[ %s ], new_version:',
                value, new_version);

    if (new_version) {
      version.set( new_version );
    }

    if (dropdown_open) { dropdown_open = false }
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
</script>

<div class={ CssClass.container.join(' ') }>
  <button
    id='versions-button'
    type='button'
    class={ CssClass.button.join(' ') }
  >
    { $vers_abbr }<ChevronDownSolid class='w-4 h-4 ms-2' />
  </button>
  <Dropdown
      bind:open={ dropdown_open }
      on:show={   dropdown_show }
      class='overflow-y-auto max-h-[50vh] h-full'
      triggeredBy='#versions-button'
  >
    <div bind:this={ container_el }>
     {#each $versions_sorted as vers, idex}
      <DropdownItem
          class={ item_classes( vers, $vers_abbr ) }
          value={ idex }
          active={ vers.local_abbreviation === $vers_abbr }
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
    </div>
  </Dropdown>
</div>
