<script>
  import WordInterlinear from './WordInterlinear.svelte';

  /* Information about the verse to present:
   *  - verse_ref     The reference for this verse {String};
   *  - verse         The verse entry {Object}
   */
  export let verse_ref;
  export let verse;

  // Create a nicer representation for the verse reference
  const [ _bk, _ch, vs ]  = verse_ref.split('.');
  const verse_num         = parseInt( vs, 10 );

</script>


{#if Array.isArray( verse.markup ) }

{#if verse.markup[0].heading != null}
  <p class='s'>{verse.markup[0].heading}</p>
{/if}

<div class='verse pb-[1.5em] !flex flex-wrap gap-x-[1em] gap-y-[.75em]'>
  <p class='verse label leading-none pr-0'>{verse_num}</p>
  {#each verse.markup as markup, m_dex}
    {#if markup.text !== undefined}
      {@const word_ref = verse_ref.replaceAll('.','-') +'-'+ m_dex }
      <WordInterlinear word={markup} word_ref={word_ref} />
    {/if}
  {/each}
</div>
{/if}
