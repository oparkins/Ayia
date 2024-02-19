<script>
  import { onMount } from 'svelte';

  import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar';
  import List,      { Item,
                      Separator,
                      Graphic,
                      Text,
                      PrimaryText,
                      SecondaryText }       from '@smui/list';
  import IconButton                         from '@smui/icon-button'

  import { icons }          from '$lib/icons';
  import ToggleTheme        from '$lib/ToggleTheme.svelte';
  import UserButton         from '$lib/UserButton.svelte';
  import Drawer             from '$lib/Drawer.svelte';
  import { theme,
           drawer_closed }  from "$lib/stores.js";

  const toggle_drawer = () => {
    /*
    console.log('toggle_drawer()');
    // */

    drawer_closed.set( !$drawer_closed );

  };

  /*
  console.log('layout.drawer_closed[ %s ]', String($drawer_closed));
  // */
</script>

<svelte:head>
  <!-- fonts -->
  <link rel="stylesheet" href="/css/fonts.css" />

  <!-- theme -->
  {#if $theme == 'dark'}
    <link rel="stylesheet" href="/css/smui-dark.css" />
  {:else}
    <link rel="stylesheet" href="/css/smui.css" />
  {/if}
</svelte:head>

<div class="app">
  <TopAppBar variant='static' dense>
    <Row>
      <Section>
        <IconButton
            class="material-icons"
            on:click={ toggle_drawer } >
          { $drawer_closed ? icons.drawer_open : icons.drawer_close }
        </IconButton>
        <Title>CMDAA</Title>
        <ToggleTheme />
      </Section>
      <Section align="end" toolbar>
        <UserButton />
      </Section>
    </Row>
  </TopAppBar>
  <div class="app-body">
    <Drawer />

    <main class="main-content">
      <slot />
    </main>
  </div>
</div>

<style>
  :root {
    font-family:  Roboto;
    font-size:    16px;
    line-height:  24px;
    font-weight:  400;

    font-synthesis: none;
    text-rendering: optimizeLegibility;

    -webkit-font-smoothing:   antialiased;
    -moz-osx-font-smoothing:  grayscale;
    -webkit-text-size-adjust: 100%;
  }

  .app {
    display:        flex;
    flex-direction: column;
    height:         100vh;
    width:          100vw;
  }
  .app-body {
    display:        flex;
    flex-direction: row;
    width:          100vw;
    height:         100%;
    min-height:     600px;

    box-sizing:     border-box;
  }

  main.main-content {
    flex-basis:     100%;
    flex-grow:      1;

    display:        flex;
    flex-direction: row;

    height:         100%;

    /*overflow:       auto;*/

    padding:        0 1em;

    box-sizing:     border-box;
  }
</style>
