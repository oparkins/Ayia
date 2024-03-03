<script>
  import WordInterlinear from './WordInterlinear.svelte';

  /* Information about the verse to present:
   *  - verse_ref     The reference for this verse {String};
   *  - verse         The verse entry {Object}
   */
  export let verse_ref;
  export let verse;

  // Create a nicer representation for the verse reference
  const verse_num = parseInt(verse_ref.split(".")[2], 10);

</script>


{#if Array.isArray( verse.markup ) }
<div class='inline-flex flex-wrap'>
  <p class="pt-[1em]">{verse_num}</p>
  {#each verse.markup as markup, m_dex}
    {#if markup.text !== undefined}
      <WordInterlinear word={markup} word_ref={verse_ref.replaceAll('.','-') + m_dex} />
    {/if}
  {/each}
</div>
{/if}