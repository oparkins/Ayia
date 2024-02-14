import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig(({ command, mode, ssrBuild }) => {
  // Basic config using sveltekit
  const config = {
    plugins: [sveltekit()],
    test: {
      include: ['src/**/*.{test,spec}.{js,ts}'],
    },
  };

  /*
  console.log('vite.defineConfig(): command[ %s ], mode[ %s ] ...',
              command, mode);
  // */

  if (mode === 'development') {
    // Force the building of sourcemaps for both client and server
    config.build = {sourcemap:true};
  }

  return config;
});

/*
export default defineConfig({
  plugins: [sveltekit()],
  test: {
    include: ['src......{test,spec}.{js,ts}']
  }
});
// */
