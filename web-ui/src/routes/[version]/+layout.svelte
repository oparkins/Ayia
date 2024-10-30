<script>
  import { version }  from '$lib/stores';

  // Load data from +layout.js: {version}
  export let data;

  // /*
  console.log('>>> [version]/+layout.svelte: data:', data);
  // */

  function do_update( vers ) {
    console.log('>>> [version]/+layout.svelte: vers:', vers);

    version.primary.set( data.version );
  }

  $: do_update( data.version );

  // :XXX: setContext('version', version) moved up

</script>

<slot />
