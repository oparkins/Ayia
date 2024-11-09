<script>
  import { verse, content } from '$lib/stores';
  import Version            from '$lib/Version.svelte';

  // Load data from parent and +layout.js: {vesions, version, verse }
  export let data;

  // /*
  console.log('>>> [version]/[verse]/+page.svelte: data:', data);
  // */

  function update_verse( new_verse ) {
    // /*
    console.log('>>> [version]/[verse]/+page.svelte: update_verse:',
                new_verse);
    // */

    verse.set( new_verse );
  }

  function update_content( new_content ) {
    // /*
    console.log('>>> [version]/[verse]/+page.svelte: update_content:',
                new_content);
    // */

    content.set( new_content );
  }

  // Update the verse and content stores
  $: update_verse(   data.verse );
  $: update_content( data.content );

  /* :XXX: setContext('verse',   verse);
   *       setContext('content', content);
   *
   *        moved up
   */

  /*
  console.log('>>> [version]/[verse]/+page.svelte: data:', data);
  // */
</script>

<svelte:head>
  <title>Ayia</title>
  <meta name="description" content="Ayia Bible UI" />
</svelte:head>

<Version
    version={ data.version }
    verse={ data.verse }
    content={ data.content }
/>
