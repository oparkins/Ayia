<script>
  import { Popover }  from 'flowbite-svelte';

  import { MessageCaptionSolid, LinkOutline } from 'flowbite-svelte-icons';

  /* Incoming properties:
   *  - id      The id of the note {String};
   *  - label   The note label {String};
   *  - type    The note type (xref | foot) {String}
   */
  export let id;
  export let label;
  export let type;

</script>

<div class='note {type || 'foot'}'>
  <sup>
   {#if type === 'xref'}
    <LinkOutline id={ id } class='note label' title={ label } />
   {:else}
    <MessageCaptionSolid id={ id } class='note label' title={ label } />
   {/if}
  </sup>
  <Popover triggeredBy='#{id}' class='note content'>
    <slot />
  </Popover>
</div>
