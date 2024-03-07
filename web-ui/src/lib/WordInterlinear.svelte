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

 
<div class="pl-[1em] pr-[1em] pt-[1em] inline-flex flex-col">
  {#if $show_il_english }
  <div>
    <p id='en_{word_ref}' class="inline text-yellow-300 text-[1.125em]">{word.text}</p>
    {#if $show_xrefs && word.xref != null}
        <VerseNote id='xref_{word_ref}' type="xref" label="#">
          {word.xref}
        </VerseNote>
      {/if}
    </div>
    <Popover triggeredBy='#en_{word_ref}' placement='bottom' class='note-content z-20'>
      {word.bdb}
    </Popover>
  {/if}


  {#if $show_il_wlc }
    <p id='wlc_{word_ref}'>{word.wlc}
      {#if $show_il_strongs }
        <sup>{word.strongs}</sup>
      {/if}
    </p>

    {#if !$show_il_translit }
      <Popover triggeredBy='#wlc_{word_ref}' placement='bottom' class='note-content z-20'>
        {word.translit}
      </Popover>
    {/if}
  {/if}

  {#if $show_il_translit }
    <p class="text-[.75em]">({word.translit})</p>
  {/if}

  {#if $show_il_tos }
  <p id='tos_{word_ref}' class="text-[.875em]">
    {word.tos}
  </p>
  <Popover triggeredBy='#tos_{word_ref}' placement='bottom' class='note-content z-20'>
    {word.tos_label}
  </Popover>
  {/if}
  
</div>
