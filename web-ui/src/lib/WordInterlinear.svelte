<script>

  import {
    show_il_english,
    show_il_translit,
    show_il_wlc,
    show_il_strongs,
    show_il_tos,
    show_xrefs
  } from '$lib/stores';
  
  import { Popover }  from 'flowbite-svelte';
  import VerseNote from './VerseNote.svelte';

  /* Information about the verse to present:
   *  - word_ref      The reference for this word {String};
   *  - word          The word entry {Object}
   */
  export let word_ref;
  export let word;

</script>

<div class='text-center leading-none'>
  <div>
    <p class="inline">
      {word.text}
    </p>
    {#if $show_xrefs && word.xref}
        <VerseNote id='{word_ref}' type="xref" label="#">
          {word.xref}
        </VerseNote>
      {/if}
    </div>

  <p id='wlc_{word_ref}' class='text-blue-400 text-[.9em]'>{word.wlc}</p>

    <Popover
        class='note-content z-20'
        triggeredBy='#wlc_{word_ref}'
        placement='bottom'
    >
      
      {word.bdb}
      <div class='px-[.5em] pt-[.5em] text-[.8em] text-gray-400'>
        <p>Translit: {word.translit}</p>
        <p>Strongs {word.language}: {word.strongs}</p>
        <p>{word.tos_label} ( {word.tos} )</p>
      </div>
    </Popover>

  {#if $show_il_translit }
    <p class='text-gray-400 text-[.9em]'>{word.translit}</p>
  {/if}
</div>
