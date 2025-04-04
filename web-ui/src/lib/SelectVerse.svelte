<script>
  /**
   *  Provide a verse selector.
   *
   *  @element  SelectVerse
   *  @prop     [verse]               The current verse {Object};
   *
   *  Dispatches event:
   *    'versechanged'  { detail: {Verse} }
   *
   *  External properties {
   */
  export let  verse = null;

  /*  External properties }
   *************************************************************************
   *  Imports {
   *
   */
  import { getContext, afterUpdate, createEventDispatcher } from 'svelte';
  import { get, derived, writable }  from 'svelte/store';
	import { page } from '$app/stores';

  import { Input }  from 'flowbite-svelte';
  import Fitty      from 'fitty';

  import { VerseRef } from '$lib/verse_ref';

  // Adapt fitty so we don't get a server-side error
  const fitty = (typeof(Fitty) === 'function' ? Fitty : () => {} );

  const versions_store  = getContext( 'versions' );
  const verse_store     = getContext( 'verse' );

  /*  Imports }
   *************************************************************************
   *  Local state {
   */
  let   container_el  = null;
  const dispatch  = createEventDispatcher();
  const verse_ref = writable( (verse        && verse.ui_ref) ||
                              ($verse_store && $verse_store.ui_ref) ||
                              '' );

  // Keep `verse_ref` in-sync with any external changes to `verse_store`
  verse_store.subscribe( (val) => {
    const ref = (val && val.ui_ref) || '';

    verse_ref.set( ref );
  });

  /*  Local state }
   *************************************************************************
   *  Methods {
   */

  /**
   *  Handle a change to the verse input.
   *
   *  @method verse_change
   *  @param  event   The triggering event {Event};
   *
   *  @return void
   */
  function verse_change( event ) {
    const versions      = get( versions_store );
    const verse_ref_ro  = get( verse_ref );
    const new_verse     = new VerseRef( verse_ref_ro, versions );

    // assert( event.target.value === verse_ref_ro );

    /*
    console.log('SelectVerse.verse_change(): value[ %s / %s ], new_verse:',
                event.target.value, verse_ref_ro, new_verse);
    // */

    if (new_verse && new_verse.is_valid) {
      const new_ref = new_verse.ui_ref;

      verse_ref.set( new_ref );
      dispatch( 'versechanged', new_verse );
    }
  }

  // As soon as this component has been updated, invoke fitty on the input
  afterUpdate(async () => {
    const $verse  = (container_el && container_el.querySelector('#verse'));

    if ($verse) {
      /* Remove any existing styling so fitty will properly reduce the size if
       * needed.
       */
      $verse.removeAttribute('style');

      fitty( $verse, { minSize: 10, maxSize: 32, multiLine: false } );
    }
  });

  /*  Methods }
   *************************************************************************
   *  Styling {
   */
  const Css = {
    container: [
      'flex-grow',

      'flex',
      'flex-row',
    ],

    input: [
      'inline-flex',
      'z-10',
      'rounded-lg',
      'p-1',

      'whitespace-nowrap',
      'leading-none',
      'text-center',

      'text-2xl',

      //'border',
      'focus:ring-1',
      'focus:outline-none',

      'text-black',
      'bg-gray-100',
      'border-gray-200',
      'hover:bg-gray-200',
      'focus:bg-gray-200',
      'focus:ring-blue-500',

      'dark:text-white',
      'dark:bg-gray-900',
      'dark:border-gray-800',
      'dark:hover:bg-gray-800',
      'dark:focus:bg-gray-800',
      'dark:focus:ring-blue-500',
    ],
  };

  /*  Styling }
   *************************************************************************/
</script>

<div class={ Css.container.join(' ') } bind:this={ container_el }>
  <Input
    id='verse'
    type='text'
    placeholder='Verse'
    class={ Css.input.join(' ') }
    bind:value={ $verse_ref }
    on:change={  verse_change }
    required
  />
</div>
