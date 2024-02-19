<script>
  import { get }              from "svelte/store";

  import IconButton           from '@smui/icon-button';
  import Tooltip, { Wrapper } from '@smui/tooltip';

  import { icons }            from '$lib/icons';
  import { theme }            from "$lib/stores.js";

  const toggleTheme = () => {
    const new_theme = (get(theme) === 'dark' ? 'light' : 'dark');

    theme.set( new_theme );
  }
</script>

<Wrapper>
  <IconButton class="material-icons" on:click={toggleTheme}>
    {$theme === 'light' ? icons.theme_light : icons.theme_dark}
  </IconButton>
  <Tooltip xPos="start" yPos="below">
    {$theme} mode : click to toggle
  </Tooltip>
</Wrapper>
