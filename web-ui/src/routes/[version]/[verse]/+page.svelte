<script>
  import Version  from '$lib/Version.svelte';

  // Load data : {vesions, version, verse, content}
  export let data;

  // /*
  console.log('>>> [version]/[verse]/+page.svelte: data:', data);
  // */
</script>

<svelte:head>
  <title>Ayia</title>
  <meta name="description" content="Ayia Bible UI" />
</svelte:head>

<Version version={ data.version } verse={ data.verse } content={ data.content }/>
