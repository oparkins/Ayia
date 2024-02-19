<script>
  import { goto }                 from '$app/navigation';

  import Button, { Icon, Label }  from '@smui/button';
  import Menu                     from '@smui/menu';
  import { Anchor }               from '@smui/menu-surface';
  import List, { Item,
                 Separator,
                 Text }           from '@smui/list';

  import { icons }        from '$lib/icons';
  import { user }         from '$lib/stores';
  import { auth_refresh,
           auth_revoke }  from '$lib/users';

  let anchorClasses = {};
  let menuOpen      = false;
  let menuIcon      = icons.expand_more;
  let menu;
  let anchor;

  const toggle_menu = ( event ) => {
    menuOpen = !menuOpen;
    menuIcon = (menuOpen ? icons.expand_less : icons.expand_more);

    menu.setOpen( menuOpen );
  };

  const on_refresh = () => {
    console.log('UserButton.on_refresh() ...');
    toggle_menu();
    auth_refresh( $user );
  };
  const on_logout = () => {
    console.log('UserButton.on_logout() ...');
    toggle_menu();
    auth_revoke();

    // Redirect to home
    goto('/');
  };

</script>

{#if $user != null}
  <div
    class={Object.keys(anchorClasses).join(' ')}
    use:Anchor={{
      addClass: (className) => {
        console.log('anchor.addClass( %s )', className);
        if (!anchorClasses[className]) {
          anchorClasses[className] = true;
        }
      },
      removeClass: (className) => {
        console.log('anchor.removeClass( %s )', className);
        if (anchorClasses[className]) {
          delete anchorClasses[className];
          anchorClasses = anchorClasses;
        }
      },
    }}
    bind:this={anchor}
  >
    <Button on:click={ toggle_menu }>
      <Icon class="material-icons">{ icons.user }</Icon>
      <Icon class="material-icons">{ menuIcon }</Icon>
    </Button>
    <Menu
      bind:this={menu}
      anchor={false}
      bind:anchorElement={anchor}
      anchorCorner="BOTTOM_LEFT"
    >
      <List>
        <Item on:SMUI:action={ on_refresh }>
          <Text>
            { $user.user_name }
          </Text>
        </Item>
        <Separator />
        <Item on:SMUI:action={ on_logout }>
          <Text>
            Signout
          </Text>
        </Item>
      </List>
    </Menu>
  </div>

{:else}
  <Button href='/login'>
    <Label>Sign in / Register</Label>
  </Button>
{/if}
