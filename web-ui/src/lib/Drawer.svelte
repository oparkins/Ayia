<script>
  import List,      { Item,
                      Separator,
                      Graphic,
                      Text,
                      PrimaryText,
                      SecondaryText }       from '@smui/list';

  import { icons }          from '$lib/icons';
  import { user }           from '$lib/stores';
  import { drawer_closed }  from "$lib/stores.js";

  /*
  console.log('Drawer.drawer_closed[ %s ]', String($drawer_closed));
  // */
</script>

<div class="app-drawer"
     class:closed={ $drawer_closed }>
  <List>
    <Item class="drawer-item">
      <a class="nav-link"
         href='/'>
        <Graphic class="material-icons drawer-icon"
                 aria-hidden="true">{icons.home}</Graphic>
        <Text>Home</Text>
      </a>
    </Item>
{#if $user != null}
    <Item class="drawer-item">
      <a class="nav-link"
         href='/logs'>
        <Graphic class="material-icons drawer-icon"
                 aria-hidden="true">{icons.log}</Graphic>
        <Text>Logs</Text>
      </a>
    </Item>
    <Item class="drawer-item">
      <a class="nav-link"
         href='/runs'>
        <Graphic class="material-icons drawer-icon"
                 aria-hidden="true">{icons.run}</Graphic>
        <Text>Runs</Text>
      </a>
    </Item>
    <Item class="drawer-item">
      <a class="nav-link"
         href='/deployments'>
        <Graphic class="material-icons drawer-icon"
                 aria-hidden="true">{icons.deployment}</Graphic>
        <Text>Deploys</Text>
      </a>
    </Item>
{/if}
  </List>
</div>

<style>
  .app-drawer {
    flex-basis:       128px;
    flex-grow:        0;
    flex-shrink:      0;

    display:          flex;
    flex-direction:   row;

    height:           100%;

    overflow:         hidden;
    padding:          0;
    box-sizing:       border-box;

    background-color: var( --mdc-theme-surface );

    transition:       flex-basis .2s;
  }

  .app-drawer.closed {
    flex-basis: 40px;
  }

  * :global(.drawer-item) {
    width:    100%;
    padding:  0 .5em;
  }
  * :global(.drawer-icon) {
    margin-right: .5em;
  }
  * :global(.nav-link) {
    display:          flex;
    flex-direction:   row;
    align-items:      center;

    height:           100%;

    color:            inherit;
    text-decoration:  none;
  }
</style>
