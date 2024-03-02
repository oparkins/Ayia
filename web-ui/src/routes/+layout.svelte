<script>
  import '../app.pcss';

  import { get }  from 'svelte/store';

  import {
    Navbar, NavBrand, NavLi, NavUl, NavHamburger,
    DarkMode, Button, Input,
  } from 'flowbite-svelte';

  import { SearchOutline } from 'flowbite-svelte-icons';

  import { theme, content_font_size } from '$lib/stores';
  import { set_cssVariable }          from '$lib/css';

  // Subscribe to changes to the content_font_size to apply them to the DOM
  content_font_size.subscribe( (val) => {
    /*
    console.log('+layout: $content_font_size changed to [ %s ]', val);
    // */

    set_cssVariable( '--content-font-size', `${val}px` );
  });

  /**
   *  Mirror flow-bite DarkTheme changes to our store.
   *  
   *  @method themeChanged
   *  @param  ev      The triggering event {PointerEvent};
   *
   *  flow-bite/DarkTheme changes are applied directly to localStorage and,
   *  since we are on the same page, are not reflected in a 'storage' event
   *  to enable synchronizing localStorage with our store.
   */
  const themeChanged = (ev) => {
    const curTheme  = get( theme );
    const newTheme  = localStorage.getItem('color-theme');

    if (curTheme !== newTheme) {
      /*
      console.log('>>> themeChanged:', ev);
      console.log('>>>   %s => %s', curTheme, newTheme);
      // */

      theme.set( newTheme );
    }

    /* flow-bite/DarkTheme toggleTheme()
    const target = ev.target as HTMLElement;
    const isDark = target.ownerDocument.documentElement.classList.toggle('dark');
    if (target.ownerDocument === document)
      // we are NOT in the iFrame
      localStorage.setItem('color-theme', isDark ? 'dark' : 'light');
    // */
  };
</script>

<svelte:head>
  <script>
    if ('content_font_size' in localStorage) {
      // explicit preference - immediately apply overrides
      const ls_val    = localStorage.getItem('content_font_size');
      const font_size = parseInt( ls_val );

      /*
      console.log('+layout: Client-init, ls_val[ %s ] => %s / %s ...',
                    ls_val, typeof(font_size), font_size);
      // */

      if (! Number.isNaN( font_size )) {
        /* :XXX: No access to our helper function (set_cssVarialbe()) so
         *       manually perform this early initialization.
         */
        document.documentElement.style.setProperty( '--content-font-size',
                                                    `${font_size}px` );
      }
    }
  </script>
</svelte:head>

<div class='flex flex-col h-screen w-screen'>
  <Navbar fluid>
      <NavBrand href='/'>
        <span class='self-start whitespace-nowrap text-xl font-semibold dark:text-white'>
          Ayia
        </span>
      </NavBrand>
      <div class='flex md:order-2'>
        <div class='p-0 m-0' aria-hidden='true' on:click={ themeChanged }>
          <DarkMode class='mx-4' />
        </div>

        <Button
            color='none'
            data-collapse-toggle='mobile-menu-3'
            aria-controls='mobile-menu-3'
            aria-expanded='false'
            class='md:hidden text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 me-1'
        >
          <SearchOutline class='w-5 h-5' />
        </Button>
        <div class='hidden relative md:block'>
          <div class='flex absolute inset-y-0 start-0 items-center ps-3 pointer-events-none'>
            <SearchOutline class='w-4 h-4' />
          </div>
          <Input id='search-navbar' class='ps-10' placeholder='Search...' />
        </div>
        <NavHamburger />
      </div>
      <NavUl>
        <NavLi href='/' active={true}>Home</NavLi>
        <NavLi href='/about'>About</NavLi>
        <NavLi href='/settings'>Settings</NavLi>
      </NavUl>
  </Navbar>
  <div class='flex flex-row w-screen h-full overflow-hidden'>
    <main class='grow basis-full flex flex-row h-full px-4'>
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
</style>
