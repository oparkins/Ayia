/**
 *  Service worker to enable PWA.
 *
 *  https://kit.svelte.dev/docs/modules#$service-worker
 *
 *  https://kit.svelte.dev/docs/service-workers#inside-the-service-worker
 *
 *  :NOTE: $service-worker{version} === $app/environment{version}
 *
 *         IF `config.kit.version` is set within svelte.config.js, this value
 *         will be used, otherwise `version` will be the current timestamp.
 *
 *         @sveltejs/kit{VERSION} === sveltekit version
 */
import { build, files, version} from '$service-worker';

const worker              = self;
const CACHE_NAME          = `cache-${version}`;
const OFFLINE_CACHE_NAME  = `offline-${version}`;


// `build` is an array of all the files generated by the bundler,
// `files` is an array of everything in the `static` directory
const to_cache      = build.concat( files );
const staticAssets  = new Set( to_cache );

/**
 *  Install the app, adding static assets to cache.
 *
 */
worker.addEventListener('install', (event) => {
  // /*
  console.log('service-worker: install version[ %s ]: cache %d to %s ...',
               version, to_cache.length, CACHE_NAME);
  // */

  event.waitUntil(
    caches
      .open( CACHE_NAME )
      .then((cache) => cache.addAll( to_cache ))
      .then(()      => { worker.skipWaiting() })
  );
});

/**
 *  Activate the app.
 *
 */
worker.addEventListener('activate', (event) => {
  /*
  console.log('service-worker: activate version[ %s ] ...', version);
  // */

  event.waitUntil(
    caches
      .keys()
      .then(async (keys) => {
        // delete old caches
        for (const key of keys) {
          if (key !== CACHE_NAME) {
            console.log('service-worker: activate [ %s ] -- delete %s ...',
                          version, key);

            await caches.delete(key);
          }
        }

        worker.clients.claim();
      })
  );
});

/**
 *  Fetch the asset from the network and store it in the cache.
 *  Fall back to the cache if the user is offline.
 */
async function fetchAndCache( request ) {
  const cache = await caches.open( OFFLINE_CACHE_NAME );

  try {
    // Attempt a fetch
    const response = await fetch( request );

    /*
    console.log('service-worker: fetchAndCache( %s ): success, cache %s ...',
                request.url, OFFLINE_CACHE_NAME);
    // */

    // Put the new content in cache
    cache.put( request, response.clone() );

    return response;

  } catch (err) {
    // Fetch failed (offline?) -- see if it is in cache
    const response = await cache.match( request );

    if (response) {
      console.log('service-worker: fetchAndCache( %s ): return cached ...',
                  request.url);

      return response;
    }

    console.log('service-worker: fetchAndCache( %s ): failed:',
                request.url, err);
    throw err;
  }
}

/**
 *  Handle a 'fetch' request
 */
worker.addEventListener('fetch', (event) => {
  const request = event.request;

  if (request.method !== 'GET' || request.headers.has('range')) {
    // No special processing for non-GET or 'range' requests
    return;
  }

  const url = new URL( request.url );

  // don't try to handle e.g. data: URIs
  const isHttp              = url.protocol.startsWith( 'http' );
  const isDevServerRequest  = (url.hostname === self.location.hostname &&
                               url.port     !== self.location.port);
  const isStaticAsset       = (url.host === self.location.host &&
                               staticAssets.has( url.pathname ));
  const skipBecauseUncached = (request.cache === 'only-if-cached' &&
                               !isStaticAsset);

  if (isHttp && !isDevServerRequest && !skipBecauseUncached) {
    event.respondWith(
      (async () => {
        /* always serve static files and bundler-generated assets from cache.
         *
         * If your application has other URLs with data that will never change,
         * set this variable to true for them and they will only be fetched
         * once.
         */
        const cachedAsset = (isStaticAsset &&
                              (await caches.match( request )));

        /*
        if (cachedAsset) {
          console.log('service-worker: fetch( %s ): cached asset',
                      request.url);
        }
        // */

        return ( cachedAsset || fetchAndCache( request ) );
      })()
    );
  }
});
