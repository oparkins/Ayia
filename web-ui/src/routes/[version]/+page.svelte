<script>
  import Version  from '$lib/Version.svelte';

  // Load data from +layout.js: {version}
  export let data;

  // /*
  console.log('>>> [version]/+page.svelte: data:', data);
  // */

</script>

<svelte:head>
  <title>Ayia</title>
  <meta name="description" content="Ayia Bible UI" />
</svelte:head>

<Version version={ data.version } />
