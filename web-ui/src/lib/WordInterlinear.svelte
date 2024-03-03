<script>

  import {
    show_interlin_english,
    show_interlin_translit,
    show_interlin_wlc,
    show_interlin_strongs,
    show_interlin_tos,
  } from '$lib/stores';
  
  import { Popover }  from 'flowbite-svelte';

  /* Information about the verse to present:
   *  - word_ref      The reference for this word {String};
   *  - word          The word entry {Object}
   */
  export let word_ref;
  export let word;

</script>

 
<div class="p-[1em] inline-flex flex-col">
  {#if $show_interlin_english }
    <p class="text-yellow-300 text-[1.125em]">{word.text}</p>
  {/if}

  {#if $show_interlin_wlc }
    <p id='wlc_{word_ref}'>{word.wlc}
      {#if $show_interlin_strongs }
        <sup>{word.strongs}</sup>
      {/if}
    </p>

    {#if !$show_interlin_translit }
      <Popover triggeredBy='#wlc_{word_ref}' placement='bottom' class='note content z-20'>
        {word.translit}
      </Popover>
    {/if}
  {/if}

  {#if $show_interlin_translit }
    <p class="text-[.75em]">({word.translit})</p>
  {/if}

  {#if $show_interlin_tos }
  <p id='tos_{word_ref}' class="text-[.875em]">
    {word.tos}
  </p>
  <Popover triggeredBy='#tos_{word_ref}' placement='bottom' class='note content z-20'>
    {word.tos_label}
  </Popover>
  {/if}
</div>


   