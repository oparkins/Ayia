<script>
  import { user } from '$lib/stores';
</script>

<svelte:head>
  <title>Ayia</title>
  <meta name="description" content="Ayia Bible UI" />
</svelte:head>

<section>
  <h3>Ayia</h3>

{#if $user == null}
  <p>
    Ayia is a web-based Bible study application that allows multiple versions
    of the Bible to be views simultaneously.
  </p>

  <p>
    <a href='/login'>Sign-in or Register</a> for access.
  </p>
{:else}
  <p>
    Welcome! Access versions and other research materials using the navigation
    bar to the left.
  </p>
{/if}
</section>

<style>
  section {
    display:    block;
    max-width:  50em;
  }
</style>
