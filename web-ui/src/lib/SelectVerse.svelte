<script>
  import { derived }  from 'svelte/store';

  import { Input }    from 'flowbite-svelte';

  import { verse as verse_store } from '$lib/stores';
  import { set_verse }            from '$lib/verse_ref';

  // CSS Class values for elements
  const CssClass = {
    container: [
      'flex-grow',

      'flex',
      'flex-row',
    ],

    input: [
      'inline-flex',
      'z-10',
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
  };

  let verse_input = ($verse_ref && $verse_ref.ui_ref || '');

  // Derive local state from store
  const verse_ref = derived( verse_store, ($verse_store) => {
    verse_input = ( $verse_store && $verse_store.ui_ref );
    return verse_input;
  });

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

</script>

<div class={ CssClass.container.join(' ') }>
  <Input
    id='verse'
    type='text'
    placeholder='Verse'
    class={ CssClass.input.join(' ') }
    bind:value={ verse_input }
    on:change={  verse_change }
    required
  />
</div>
