#!/usr/bin/env node
import * as Url   from 'url';
import * as Path  from 'path';
import * as Http  from 'http';
import express    from 'express';
import Yargs      from 'yargs';

import generate_config  from './lib/generate_config.js';
import { handler }      from './dist/handler.js';

// Establish __filename and __dirname
const __filename  = Url.fileURLToPath( import.meta.url );
const __dirname   = Url.fileURLToPath( new URL('.', import.meta.url) );

// Specify and parse arguments
const args  = Yargs( process.argv )
  .options({
    c: {
      alias       : 'config',
      describe    : 'A YAML configuration file.',
      default     : Path.join( __dirname, 'etc', 'config.yaml'),
      type        : 'string',
    },
    v: {
      alias       : 'verbosity',
      describe    : 'Increase debug verbosity.',
      count       : true,
      //default     : 0,
      //type        : 'boolean',
      //demandOption: true,
    },
    h: { alias : [ '?', 'help' ] },
  })
  .help()
  .argv;

// Generate a configuration using the incoming arguments
const config  = generate_config( args );

// Create the Express application
const app = express();
 
// Add a route that lives separately from the SvelteKit app
app.get('/healthcheck', (req, res) => {
  res.end('ok');
});

// Add a route to allow the client access to configuration data
app.get('/config', (req, res) => {
  res.status( 200 )
    .json( config );
});
 
/* Let SvelteKit handle everything else, including serving prerendered pages
 * and static assets
 */
app.use( handler );
 
/* Create our own server (so we can retrieve the address).
 *
 * If we didnt' need access to the server directly, we could just:
 *  app.listen( config.web_ui, () => {
 *    console.log('>>> listening on %s', config.web_ui.port);
 *  });
 */
const server  = Http.createServer( app );
server.listen( config.web_ui, () => {
  console.log('>>> listening:',  server.address());
});
