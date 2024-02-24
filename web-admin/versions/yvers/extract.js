/**
 *  Extract data from a Bible version fetched via `Yvers.fetch.version()` to a
 *  flat JSON format.
 *
 */
const Fs    = require('fs');
const Path  = require('path');
const Unzip = require('unzipper');

const { PATH_CACHE }  = require('./constants');
const Fetch           = require('./fetch');

/****************************************************************************
 * Public methods {
 *
 */

/**
 *  Extract the data for the named version.
 *
 *  @method extract_version
 *  @param  vers    The target version {String};
 *  @param  config                  Fetch configuration {Object};
 *  @param  config.vers             The target version {String};
 *  @param  [config.version = null] If provided, pre-fetched information about
 *                                  the target version (Yvers.fetch.find()). If
 *                                  this is provided, `config.vers` may be
 *                                  omitted {Version};
 *  @param  [config.outPath = null] A specific output path, overriding the
 *                                  default cache {String};
 *  @param  [config.force = false]  If truthy, extract even if the data is
 *                                  already cached {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *  @param  [config.returnVersion = false]
 *                                  If truthy, return the extracted version
 *                                  data {Boolean};
 *
 *  @return A promise for the version index {Promise};
 *          - on success, the path to the location holding the extracted data
 *                        OR the top-level version data {String | Version};
 *          - on failure, rejects  with an error {Error};
 */
async function extract_version( config ) {
  if (config == null) { throw new Error('Missing required config') }

  let version = config.version;
  if (version == null) {
    if (config.vers == null) {
      throw new Error('Missing required config.vers | config.versions');
    }

    // Fetch information about the target version
    version = await Fetch.find( config.vers );
    if (version == null) {
      throw new Error(`Cannot find version ${config.vers}`);
    }
  }

  // Update `config` using the official abbreviation
  const ABBR  = version.abbreviation;

  config  = Object.assign({
              outPath   : _cachePath( `${ABBR}.json` ),
              force     : false,
              verbosity : 0,
            }, config || {});

  const isCached  = Fs.existsSync( config.outPath );

  if (config.force || ! isCached) {
    const configFetch = { version, verbosity: config.verbosity };
    const dataPath    = await Fetch.version( configFetch );

    if (config.verbosity) {
      console.log('>>> Extract %s: begin extraction from %s ...',
                  version.abbreviation, dataPath);
    }

    const books = await _extract_data( dataPath );

    version.books = books;

    if (config.verbosity) {
      console.log('>>> Extract %s: found %d books',
                  version.abbreviation, books.size);
    }

    if (config.verbosity > 1) {
      console.log('>>> Extract %s: generating flat JSON ...',
                  version.abbreviation);
    }

    // Convert to JSON (properly handling Map and Buffer values) and write
    const json  = _toJson( version );

    if (config.verbosity > 1) {
      console.log('>>> Extract %s: generation complete',
                  version.abbreviation);
    }

    Fs.writeFileSync( config.outPath, json );

  } else if (config.verbosity) {
    console.log('>>> Extract %s: use existing cache: %s',
                ABBR, config.outPath);

  }

  if (config.returnVersion) {
    // Read the data from cache
    const data  = Fs.readFileSync( config.outPath );
    version = JSON.parse( data );

    // Pass along cache location information
    version._cache = Object.assign( { extract: config.outPath },
                                    version._cache || {} );
  }

  return (config.returnVersion ? version : config.outPath);
}

/* Public methods }
 ****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Extract data from the fetched file.
 *
 *  @method _extract_data
 *  @para path    The path to the fetched file {String};
 *
 *  @return A promise for results {Promise};
 *          - on success, resolves with the books map {Map};
 *                            Map {
 *                              BOOK: { Map
 *                                1:  Chapter1-decodedData,
 *                                2:  Chapter2-decodedData,
 *                                ...
 *                              },
 *                              ...
 *                            }
 *          - on failure, rejects  with an error {Error};
 *  @private
 */
async function _extract_data( path ) {
  const directory = await Unzip.Open.file( path );
  const pending   = directory.files.map( _processFile );
  const files     = await Promise.all( pending );
  const books     = new Map();

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

  return books;
}

/**
 *  Process a single file enntry from the zip stream.
 *
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
 *  Generate a JSON-stringified version of the given data, converting any Maps
 *  to simple objects with sorted keys and buffers to their string versions.
 *
 *  @method _toJson
 *  @param  data    The target data {Object};
 *
 *  @return The JSON-stringified version {String};
 *  @private
 */
function _toJson( data ) {
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
 *  Convert a YVERS-encoded byte to the equivilent character code.
 *
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
 *
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
 *  Given a cache file, generate the path to that cache file.
 *
 *  @method _cachePath
 *  @param  file    The cache file {String};
 *
 *  @return The cache path {String};
 *  @private
 */
function _cachePath( file ) {
  return Path.join( PATH_CACHE, file );
}

/* Private helpers }
 ****************************************************************************/

module.exports  = {
  version : extract_version,
};
