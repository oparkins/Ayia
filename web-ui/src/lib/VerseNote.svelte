<script>
  import { Popover }          from 'flowbite-svelte';
  import { AnnotationSolid }  from 'flowbite-svelte-icons';

  /* Incoming properties:
   *  - id      The id of the note {String};
   *  - label   The note label {String};
   */
  export let id;
  export let label;
</script>

<div class='note inline-block'>
  <sup>
    <AnnotationSolid id={ id } class='note label' title={ label } />
  </sup>
  <Popover triggeredBy='#{id}' class='note content'>
    <slot />
  </Popover>
</div>
