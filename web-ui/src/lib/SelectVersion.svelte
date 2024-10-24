<script>
  /**
   *  Provide a version selector from the full set of available versions.
   *
   *  @element  SelectVersion
   *  @prop     version               The currently selected version {Version};
   *  @prop     [column = 'primary']  The column this selector is for
   *                                  (primary | column#) {String};
   *                                  For the 'primary' column, style with no
   *                                  end-side rounded border to allow snugging
   *                                  up against a companion SelectVerse
   *                                  element.
   *
   *  Required contexts:
   *    versions
   *    version
   *
   *  Dispatches event:
   *    'versionchanged'  { detail: {Version} }
   *
   *  External properties {
   */
  export let  version = null;
  export let  column  = 'primary';

  /*  External properties }
   *************************************************************************
   *  Imports {
   *
   */
  import { getContext, createEventDispatcher }  from 'svelte';
  import { get, writable, derived } from 'svelte/store';
  import { afterNavigate }          from '$app/navigation';

  import {
    Button,
    Dropdown,
    DropdownItem,
  } from 'flowbite-svelte';

  const versions_store  = getContext( 'versions' );
  const version_stores  = getContext( 'version' );

  /*  Imports }
   *************************************************************************
   *  Local state {
   */
  const dispatch      = createEventDispatcher();
  let   dropdown_open = false;
  let   container_el  = null;
  const version_store = version_stores[ column ];
  const vers_abbr     = writable( (version &&
                                   version.local_abbreviation) ||
                                  ($version_store &&
                                   $version_store.local_abbreviation) );

  // Derive a sorted set of versions
  const versions_sorted = derived( versions_store, ($versions_store) => {
    const versions  = ($versions_store ? $versions_store.versions : []);

    /*
    console.log('SelectVersion(): Sort %d versions ...', versions.length);
    // */

    return versions.sort( (a,b) => {
      return a.title.localeCompare( b.title );
    });
  });

  afterNavigate( (nav) => {
    /*  nav {
     *    type      : The type of navigation {String};
     *      enter   : The app has hydrated
     *      form    : The user submitted a <form>
     *      link    : Navigation was triggered by a link click
     *      goto    : Navigation was triggered by a goto(...) call or a redirect
     *      popstate: Navigation was triggered by back/forward navigation
     *
     *    from      : The previous location (null if none) {Object};
     *    to        : { The new location {Object};
     *      params  : Incoming parameters {Object};
     *      route   : { Route data {Object};
     *        id    : The id of the route {String};
     *      }
     *      url     : The full URL to the route {String};
     *    }
     *    willUnload: Will the page be unloaded {Boolean};
     *    complete  : A promise for completion {Promise};
     *  }
     */

    /*
    console.log('SelectVersion:afterNavigate:', nav);
    // */

    if (nav.type === 'popstate') {
      // Verify that the `vers_abbr` matches the new location
      const vers_abbr_ro  = get( vers_abbr );
      const to_vers       = nav.to.params.version;

      /*
      console.log('SelectVersion:afterNavigate: popstate: '
                  +         'vers[ %s ] => [ %s ]',
                  vers_abbr_ro, to_vers);
      // */

      if ( vers_abbr_ro !== to_vers ) {
        // Update our `vers_abbr` to match the new location
        vers_abbr.set( to_vers );
      }
    }
  });

  /*  Local state }
   *************************************************************************
   *  Methods {
   */

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

    /*
    console.log('SelectVersion.dropdown_select(): value[ %s ], new_version:',
                value, new_version);
    // */

    if (new_version) {
      const new_abbr  = new_version.local_abbreviation;

      vers_abbr.set( new_abbr );
      dispatch( 'versionchanged', new_version );
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
    const classes = Css.item.slice();

    /*
    console.log('item_classes(): item.abbreviation[ %s / %s ], selected[ %s ]',
                item.local_abbreviation, item.abbreviation, selected);
    // */

    if (item.local_abbreviation === selected) {
      classes.push( ...Css.item_active );
    }

    return classes.join(' ');
  }

  /*  Methods }
   *************************************************************************
   *  Styling {
   */
  const Css = {
    container: [
      'grow',
      'flex',
      'flex-row',
    ],

    button: [
      'grow',
      'flex',
      'justify-center',
      'items-center',

      'z-10',
      'p-2',

      'text-sm',
      'whitespace-nowrap',
      'font-medium',
      'text-center',
      'rounded-lg',

      //'border',
      'focus:ring-1',
      'focus:outline-none',

      'text-gray-500',
      'bg-gray-100',
      'border-gray-200',
      'hover:bg-gray-200',
      'hover:text-black',
      'focus:ring-blue-500',

      'dark:text-gray-500',
      'dark:bg-gray-900',
      'dark:border-gray-800',
      'dark:hover:bg-gray-800',
      'dark:hover:text-white',
      'dark:focus:ring-blue-500',
    ],

    item: [
      'grow',

      'flex',
      'gap-x-4',
      'items-center',
      'justify-center',
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

  /*  Styling }
   *************************************************************************/
</script>

<div class={ Css.container.join(' ') }>
  <Button
    id='versions-button'
    class={ Css.button.join(' ') }
  >
    { $vers_abbr || 'Version' }
  </Button>
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
