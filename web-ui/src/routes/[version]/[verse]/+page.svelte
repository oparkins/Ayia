<script>
	import { setContext } from 'svelte';
  import { verse }      from '$lib/stores';
  import Version        from '$lib/Version.svelte';

  // Load data from parent and +layout.js: {vesions, version, verse }
  export let data;

  // /*
  console.log('>>> [version]/[verse]/+page.svelte: data:', data);
  // */

  // Expose the verse store
  $: verse.set( data.verse );

	// ...and add it to the context for child components to access
  setContext('verse', verse);

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
