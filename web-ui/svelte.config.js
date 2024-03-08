import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

//import adapter from '@sveltejs/adapter-auto';
import adapter    from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';

// Read package.json for access to the app version {
// import w/assert is currently experimental {
//import pkg from './package.json' assert { type: 'json' };
// import w/assert is currently experimental }

import { readFileSync }   from 'fs';
import { fileURLToPath }  from 'url';

const file  = fileURLToPath( new URL('package.json', import.meta.url) );
const json  = readFileSync( file, 'utf8' );
const pkg   = JSON.parse( json );
// Read package.json } */


/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [preprocess(), vitePreprocess({})],

  kit: {
    /* adapter-auto only supports some environments, see
     * https://kit.svelte.dev/docs/adapter-auto for a list.
     *
     * If your environment is not supported or you settled on a specific
     * environment, switch out the adapter.
     *
     * See https://kit.svelte.dev/docs/adapters for more information about
     * adapters.
     */
    version: {
      name: pkg.version,
    },

    // We have changed this to point to a build directory
    // adapter: adapter()
    adapter: adapter({ out: "dist" }),
  },
};

export default config;
