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
  import { createEventDispatcher }  from 'svelte';
  import { get, writable }          from 'svelte/store';

  import { Input }    from 'flowbite-svelte';

  import { verse as verse_store } from '$lib/stores';
  import { parse_verse }          from '$lib/verse_ref';

  /*  Imports }
   *************************************************************************
   *  Local state {
   */
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
    const verse_ref_ro  = get( verse_ref );
    const new_verse     = parse_verse( verse_ref_ro );

    // assert( event.target.value === verse_ref_ro );
    console.log('SelectVerse.verse_change(): value[ %s / %s ], new_verse:',
                event.target.value, verse_ref_ro, new_verse);

    if (new_verse) {
      const new_ref = new_verse.ui_ref;

      verse_ref.set( new_ref );
      dispatch( 'versechanged', new_verse );
    }
  }

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
      'rounded-s-none',
      'rounded-e-lg',

      'text-black',
      'bg-gray-100',
      'border',
      'border-gray-300',
      'hover:bg-gray-200',
      'focus:ring-4',
      'focus:outline-none',
      'focus:ring-gray-100',

      'dark:text-white',
      'dark:bg-gray-700',
      'dark:hover:bg-gray-600',
      'dark:focus:ring-gray-700',
      'dark:border-gray-600',
    ],
  };

  /*  Styling }
   *************************************************************************/
</script>

<div class={ Css.container.join(' ') }>
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
