const Fs    = require('fs');
const Http  = require('http');
const Https = require('https');

/**
 *  Fetch http(s) data.
 *  @method fetch
 *  @param  url                     The target url {String};
 *  @param  [config]                Optional fetch configuration {Object};
 *  @param  [config.outPath = null] If provided, stream the data to a file at
 *                                  the given path {String};
 *  @param  [config.contentType]    If provided, the required content type of
 *                                  the response {String};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *
 *  If no configuration is provided
 *
 *  @return A promise for results {Promise};
 *          - on success, resolve with either the response, including 'body'
 *                        data, or the path to the output file
 *                        {Response | String};
 *          - on failure, reject  with error {Error};
 */
function fetch( url, config=null ) {
  config = Object.assign({outPath:null, verbosity:0}, config || {});

  return new Promise( (resolve, reject) => {
    const EXPECT_CONTENT_TYPE = (config.contentType &&
                                 config.contentType.toUpperCase());

    if (config.verbosity) {
      console.log('>>> fetch( %s ): %s ...',
                  url, (config.outPath || 'data'));
    }

    const Proto     = (url.startsWith('https:')
                        ? Https
                        : Http);

    // Initiate the GET request
    Proto.get( url, (res) => {
      const { statusCode }  = res;
      const contentType     = res.headers['content-type'];
      const CONTENT_TYPE    = contentType.toUpperCase();
      let   error;

      if (statusCode !== 200) {
        error = new Error( `Request Failed: ${statusCode}` );

      } else if (EXPECT_CONTENT_TYPE &&
                  ! CONTENT_TYPE.startsWith( EXPECT_CONTENT_TYPE )) {

        error = new Error( 'Unexpected content-type: '
                           + `expected ${config.contentType} `
                           + `received ${contentType}` );

      }

      if (error) {
        // Consume response data to free up memory
        res.resume();
        return reject( error );
      }

      /**************************
       * Process this response
       *
       */
      if ( config.outPath ) {
        // Stream the response data to a file
        _stream_response( res, config.outPath )
          .then( res => {
            if (config.verbosity) {
              console.log('>>> Fetch Completed');
            }

            // Return the output path
            return resolve( config.outPath );
          })
          .catch( err => reject(err) );

      } else {
        // Gather data for return 
        _collect_body( res )
          .then( res => {
            if (config.verbosity) {
              console.log('>>> Fetch Completed');
            }

            // Return the response with attached `body`
            return resolve( res );
          })
          .catch( err => reject(err) );
      }

    }).on( 'error', reject );
  });
}

/****************************************************************************
 * Private helpers {
 */

/**
 *  Handle streaming an Http(s) response to the given write stream.
 *
 *  @method _stream_response
 *  @param  res       The successful response {Response};
 *  @param  outPath   The path to the output file {String};
 *
 *  @return A promise for results {Promise};
 *          - on success, true {Boolean};
 *          - on failure, an error {Error};
 *  @private
 */
function _stream_response( res, outPath ) {
  return new Promise((resolve, reject) => {
    const outStream = Fs.createWriteStream( outPath);

    // Pipe response data to the output stream
    res.pipe( outStream );

    outStream.on('error', (er) => {
      // Consume response data to free up memory
      res.resume();
      return reject( err );
    });

    // after download completed close output stream
    outStream.on('finish', () => {
      outStream.close();

      return resolve( true );
    });
  });
}

/**
 *  Collect the full data/body of an Http(s) response.
 *
 *  @method _collect_body
 *  @param  res     The response {Response};
 *
 *  @return A promise for results {Promise};
 *          - on success, the completed response with `body` {Response};
 *          - on failure, and error {Error};
 *  @private
 */
function _collect_body( res ) {
  return new Promise((resolve, reject) => {
    // Gather data for return 
    //res.setEncoding('utf8');
    const chunks  = [];

    res.on('error', (err) => {
      // Consume response data to free up memory
      res.resume();
      return reject( err );
    });

    res.on('data', (chunk) => { chunks.push( chunk ) });

    res.on('end', () => {
      res.body = Buffer.concat( chunks );

      return resolve( res );
    });
  });
}

/*
 * Private helpers }
 ****************************************************************************/
module.exports = { fetch };
