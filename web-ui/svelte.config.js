//import adapter from '@sveltejs/adapter-auto';
import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

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

		// We have changed this to point to a build directory
    // adapter: adapter()
		adapter: adapter({ out: 'dist' })
  }
};

export default config;
