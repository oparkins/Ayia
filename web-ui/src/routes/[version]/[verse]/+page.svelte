<script>
	import { setContext }     from 'svelte';
  import { verse, content } from '$lib/stores';
  import Version            from '$lib/Version.svelte';

  // Load data from parent and +layout.js: {vesions, version, verse }
  export let data;

  // /*
  console.log('>>> [version]/[verse]/+page.svelte: data:', data);
  // */

  // Update the verse and content stores
  $: verse.set(   data.verse );
  $: content.set( data.content );

	// ...and add it to the context for child components to access
  setContext('verse',   verse);
  setContext('content', content);

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
