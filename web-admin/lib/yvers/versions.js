#!/usr/bin/env node
const Fs      = require('fs');
const Path    = require('path');
const Https   = require('https');
const Unzip   = require('unzipper');
const Source  = 'https://www.bible.com';

/****************************************************************************
 * Public methods {
 *
 */

/**
 *  Fetch the current version index either cached or from the source.
 *  @method getVersions
 *  @param  [lang = 'eng']  The target language {String};
 *  @param  [type = 'all']  The target type {String};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, resolves with the version index {Object};
 *          - on failure, rejects  with an error {Error};
 */
function getVersions( lang='eng', type='all') {
  const cachePath = _cachePath( `versions-${lang}.json` );

  return new Promise( (resolve, reject) => {
    if (Fs.existsSync( cachePath )) {
      // Open the cached version
      const data  = Fs.readFileSync( cachePath );
      const json  = JSON.parse( data );

      return resolve( json );
    }

    // Fetch the index
    _fetchVersions( lang, type )
      .then( data => {
        // Cache this data
        Fs.writeFileSync( cachePath, JSON.stringify(data, null, 2) );
        return resolve( data );
      })
      .catch( err => {
        return reject( err );
      });
  });
}

/**
 *  Find information about the named version from the version index.
 *  @method findVersion
 *  @param  vers    The target version {String};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, resolves with the version information {Object};
 *          - on failure, rejects  with an error {Error};
 */
function findVersion( vers ) {
  return new Promise( (resolve, reject) => {
    getVersions()
      .then( index => {
        const VERS  = vers.toUpperCase();
        const info  = index.response.data.versions.find( (data) => {
          if (data.abbreviation       === VERS ||
              data.local_abbreviation === VERS) {
            return true;
          }

          if (data.title) {
            const TITLE = data.title.toUpperCase();
            if (TITLE === VERS) { return true }
          }

          if (data.local_title) {
            const TITLE = data.local_title.toUpperCase();
            if (TITLE === VERS) { return true }
          }

          return false;
        });

        return resolve( info );
      })
      .catch( reject );
  });
}

/**
 *  Get the data for the named version.
 *  @method getVersion
 *  @param  vers    The target version {String};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, resolves with the version information {Object};
 *                          {
 *                            id          : 1588,
 *                            abbreviation: 'AMP',
 *                            title: 'Amplified Bible',
 *                            language: { ... },
 *                            publisher_id: 37,
 *                            platforms: { ... },
 *                            offline: { ... },
 *                            metadata_build: 9,
 *                            vrs: 'eng',
 *                            ...
 *                            books: { Map
 *                              BOOK: { Map
 *                                1:  Chapter1-decodedData,
 *                                2:  Chapter2-decodedData,
 *                                ...
 *                              },
 *                              ...
 *                            }
 *                          }
 *          - on failure, rejects  with an error {Error};
 */
function getVersion( vers ) {
  const cachePath = _cachePath( `${vers}.json` );

  return new Promise( (resolve, reject) => {
    if (Fs.existsSync( cachePath )) {
      // Open the cached version
      const data  = Fs.readFileSync( cachePath );
      const json  = JSON.parse( data );

      return resolve( json );
    }

    // Fetch the index
    _fetchVersion( vers )
      .then( data => {
        /* Cache this data, converting the contained Maps and Buffers
         * to simple objects/strings.
         */
        const json  = _toJSON( data );
        const obj   = JSON.parse( json );

        Fs.writeFileSync( cachePath, json );
        return resolve( obj );
      })
      .catch( err => {
        return reject( err );
      });
  });
}

/* Public methods }
 ****************************************************************************
 * Priate helpers {
 *
 */

/**
 *  Generate a JSON-stringified version of the given data, converting any Maps
 *  to simple objects with sorted keys and buffers to their string versions.
 *  @method _toJSON
 *  @param  data    The target data {Object};
 *
 *  @return The JSON-stringified version {String};
 *  @private
 */
function _toJSON( data ) {
  function __replacer( key, val ) {
    let res = val;

    if ( val instanceof Map ) {
      // Convert a Map to a simple object with sorted keys
      res = {};

      Array.from( val.keys() ).sort().forEach( (key,idex) => {
        const keyVal  = val.get( key );

        res[key] = __replacer( idex, keyVal );
      });

    } else if ( val instanceof Buffer ) {
      // Convert a Buffer to a UTF8 string
      res = val.toString( 'utf8' );
    }

    return res;
  }

  return JSON.stringify(data, __replacer, 2);
}

/**
 *  Fetch http data.
 *  @method _fetch
 *  @param  url   The target url {String};
 *
 *  @return A promise for results {Promise};
 *          - on success, resolve with response {Response}
 *                        (including 'body' data);
 *          - on failure, reject  with error {Error};
 *  @private
 */
function _fetch( url ) {
  return new Promise( (resolve, reject) => {
    //console.log('_fetch( %s ): ...', url);

    Https.get( url, (res) => {
      const { statusCode }  = res;
      const contentType     = res.headers['content-type'];

      if (statusCode !== 200) {
        const error = new Error('Request Failed.\n' +
                                `Status Code: ${statusCode}`);

        // Consume response data to free up memory
        res.resume();
        return reject( error );
      }

      //res.setEncoding('utf8');
      const chunks  = [];

      res.on('data', (chunk) => { chunks.push( chunk ) });
      res.on('end', () => {
        res.body = Buffer.concat( chunks );

        return resolve( res );
      });

    }).on( 'error', reject );
  });
}

/**
 *  Fetch the current version index from the source
 *  @method _fetchVersions
 *  @param  [lang = 'eng']  The target language {String};
 *  @param  [type = 'all']  The target type {String};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, resolves with the version index {Object};
 *          - on failure, rejects  with an error {Error};
 *  @private
 */
function _fetchVersions( lang='eng', type='all') {
  const url = `${Source}/api/bible/versions?language_tag=${lang}&type=${type}`;

  return _fetch( url )
    .then( res => {
      const { statusCode }  = res;
      const contentType     = res.headers['content-type'];

      let error;
      // Any 2xx status code signals a successful response but
      // here we're only checking for 200.
      if (statusCode !== 200) {
        error = new Error('Request Failed.\n' +
                          `Status Code: ${statusCode}`);
      } else if (!/^application\/json/.test(contentType)) {
        error = new Error('Invalid content-type.\n' +
                          'Expected application/json' +
                          ` but received ${contentType}`);
      }

      if (error) {
        // Consume response data to free up memory
        return reject( error );
      }

      return JSON.parse( res.body );
    });
}

/**
 *  Fetch the raw (zipped) data of the named version.
 *  @method _fetchVersion
 *  @param  vers    The target version {String};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, resolves with the version information {Object};
 *                          {
 *                            id          : 1588,
 *                            abbreviation: 'AMP',
 *                            title: 'Amplified Bible',
 *                            language: { ... },
 *                            publisher_id: 37,
 *                            platforms: { ... },
 *                            offline: { ... },
 *                            metadata_build: 9,
 *                            vrs: 'eng',
 *                            type: 'yvers',
 *                            ...
 *                            books: { Map
 *                              BOOK: { Map
 *                                1:  Chapter1-decodedData,
 *                                2:  Chapter2-decodedData,
 *                                ...
 *                              },
 *                              ...
 *                            }
 *                          }
 *          - on failure, rejects  with an error {Error};
 *  @private
 */
function _fetchVersion( vers ) {
  let fullRes = null;

  return findVersion( vers )
      .then( info => {
        if (info == null) {
          throw new Error(`Cannot find version ${vers}`);
        }

        const re      = /^.*\/\//;
        const urlPath = info.offline.url.replace( re, '' );

        fullRes = info;

        return `https://${urlPath}`;
      })
      .then( url => {
        //console.log('_fetchVersion( %s ): url:', vers, url);

        return _fetch( url );
      })
      .then( res => {
        // assert( res.statusCode === 200 )
        // assert( res.body != null )
        //console.log('_fetchVersion( %s ): res:', vers, res);

        return Unzip.Open.buffer( res.body );
      })
      .then( data => {
        //console.log('_fetchVersion( %s ): data:', vers, data);
        return Promise.all( data.files.map( _processFile ) );
      })
      .then( files => {
        const books = new Map();

        files.forEach( file => {
          /* file.path has the form:
           *    BOOK/[0-9]+.yves
           */
          const [bookName, chap]  = file.path.replace(/.yves$/,'').split('/');
          const book              = books.get( bookName ) || new Map();

          // Store the chapter data as a buffer
          //book.set( chap, file.decoded );

          /* Convert the chapter data to a UTF8 string and split into
           * individual lines
           */
          const lines = file.decoded.toString('utf8').split(/\n/);
          book.set( chap, lines );  //file.decoded );

          books.set( bookName, book );
        });

        fullRes.books = books;

        // Include a 'type' in the version
        fullRes.type = 'yvers';

        return fullRes;
      });
}

/**
 *  Convert a YVERS-encoded byte to the equivilent character code.
 *  @method _byteToCode
 *  @param  bt    The target 8-bit byte {Number};
 *
 *  Each byte is nibble-swapped (bit[0-3] <=> bit[4-7]).
 *
 *  @return The equivilent character code {Number};
 *  @private
 */
function _byteToCode( bt ) {
  if (bt === undefined)  { return undefined }

  const code  = (0xff & (bt >> 5)) | (0xff & (bt << 3));

  return (code & 0xff);
}

/**
 *  Decode a YVERS-encoded buffer to an equivilent string.
 *  @method _decodeYves
 *  @param  buf   The target buffer {Buffer};
 *
 *  Each 16-bit word is byte-swapped                   :(byte[0]  <=> byte[1])
 *  AND each byte within those words are nibble-swapped:(bit[0-3] <=> bit[4-7])
 *
 *  @return The decoded buffer {Buffer};
 *  @private
 */
function _decodeYves( buf ) {
  if (! Buffer.isBuffer( buf )) { return }

  const nBytes  = buf.length;
  const newBuf  = Buffer.alloc( nBytes );

  for (let idex = 0; idex < nBytes; idex += 2) {
    const byte0 = buf[ idex ];
    const byte1 = (idex < nBytes ? buf[ idex + 1 ] : undefined);
    const code0 = _byteToCode( byte0 );
    const code1 = _byteToCode( byte1 );
    let   jdex  = idex;

    if (code1 !== undefined) {
      newBuf.writeUInt8( code1, jdex );
      jdex++;
    }

    newBuf.writeUInt8( code0, jdex );
  }

  return newBuf;
}

/**
 *  Process a single file enntry from the zip stream.
 *  @method _processFile
 *  @para file    The file entry from Unzip {Object};
 *
 *  The form of `file` is:
 *    {
 *      path            : The file path {String};
 *      compressedSize  : The size of the compressed data {Number};
 *      uncompressedSize: The size of the uncompressed data {Number};
 *      stream()        : Returns a promise for a stream of content {Stream};
 *      buffer()        : Returns a promise for a buffer of content {Buffer};
 *
 *      signature
 *      versionMadeBy
 *      versionsNeededToExtract
 *      flags
 *      compressionMethod
 *      lastModifiedTime
 *      lastModifiedDate
 *      crc32
 *      fileNameLength
 *      extraFieldLength
 *      fileCommentLength
 *      diskNumber
 *      internalFileAttributes
 *      externalFileAttributes
 *      offsetToLocalFileHeader
 *      lastModifiedDateTime
 *      pathBuffer
 *      isUnicode
 *      extra
 *      comment
 *      type
 *    }
 *
 *  @return A promise for results {Promise};
 *          - on success, resolve with the decoded HTML {String};
 *          - on failure, reject  with an error {Error};
 *  @private
 */
function _processFile( file ) {
  return file.buffer()
    .then( buf => {
      /*
      console.log('%s: %d => %d : %d',
                  file.path, file.compressedSize, file.uncompressedSize,
                  buf.length);
      // */

      file.decoded = _decodeYves( buf );
      return file;
    });
}

/**
 *  Given a cache file, generate the path to that cache file.
 *  @method _cachePath
 *  @param  file    The cache file {String};
 *
 *  @return The cache path {String};
 *  @private
 */
function _cachePath( file ) {
  return Path.join( __dirname, '..', '..', 'cache', file );
}

/* Priate helpers }
 ****************************************************************************/

module.exports  = {
  getVersions,
  findVersion,
  getVersion,
};
// vi: ft=javascript
