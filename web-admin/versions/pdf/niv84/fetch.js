/**
 *  Fetch NIV-1984 Bible PDF data from either cache or the source.
 *
 */
const Fs            = require('fs');
const Path          = require('path');
const { Readable }  = require('stream');
const { finished }  = require('stream/promises');
const Cheerio       = require('cheerio');

const FsUtils       = require('../../../lib/fs_utils');

// Constants used later
const {
  SOURCE_URL,
  PATH_PDF,
} = require('./constants');

//const { fetch }   = require('../../../lib/fetch');
const { Version } = require('./version');

/****************************************************************************
 * Public methods {
 *
 */

/**
 *  Fetch the data for this version either from cache or the source.
 *
 *  @method fetch_version
 *  @param  [config]                Fetch configuration {Object};
 *  @param  [config.outPath = null] A specific output path, overriding the
 *                                  default cache  {String};
 *  @param  [config.force = false]  If truthy, fetch even if the output file
 *                                  already exists {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *  @param  [config.returnVersion = false]
 *                                  If truthy, return the top-level version
 *                                  data {Boolean};
 *
 *  @return A promise for results {Promise};
 *          - on success, the path to the fetched data or the version data
 *                        {String | Version};
 *          - on failure, an error {Error};
 */
async function fetch_version( config=null ) {
  config  = Object.assign({
              outPath       : PATH_PDF,
              force         : false,
              verbosity     : 0,
              returnVersion : false,
            }, config||{} );

  // Prepare the cache location to receive fetched data
  await FsUtils.make_dir( PATH_PDF );

  const version = {...Version};
  const urls    = await _gather_urls( config, SOURCE_URL );

  await _fetch_urls( config, SOURCE_URL, urls );

  if (config.returnVersion) {
    // Pass along cache location information
    version._cache = Object.assign( { fetch:config.outPath },
                                    version._cache || {} );
  }

  return (config.returnVersion ? version : config.outPath);
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Fetch the source page and extract the URLs for each PDF.
 *
 *  @method _gather_urls
 *  @param  [config]                Fetch configuration {Object};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *  @param  source                  The source page {String};
 *
 *  @return The set of URLs {Array[String]};
 *  @private
 */
async function _gather_urls( config, source ) {
  const fileName  = Path.basename( source );
  const outPath   = Path.resolve( config.outPath, fileName );
  const isCached  = Fs.existsSync( outPath );
  let   body;

  if (config.force || ! isCached) {
    if (config.verbosity) {
      console.log('>>> Fetching %s ...', source);
    }

    const res   = await fetch( source );

    body = await res.text();

    if (config.verbosity > 1) {
      console.log('>>> Fetched %s byte body ...', body.length);
    }

    Fs.writeFileSync( outPath, body );

  } else {
    body = Fs.readFileSync( outPath, {encoding:'utf-8'} );

    if (config.verbosity) {
      console.log('>>> Use existing cache: %s', outPath);
    }
  }

  // 'div[itemprop="articleBody"] a[title]'
  const $             = Cheerio.load( body );
  const $articleBody  = $('div[itemprop="articleBody"]');
  const hrefs         = [];

  if (config.verbosity > 1) {
    console.log('>>> Fetch %s byte body ...', body.length);
  }

  $articleBody.find('a[title]').each( (idex, el) => {
    const href  = el.attribs['href'];
    if (href.includes('NIVBible'))  { return }
    if (! href.endsWith('.pdf'))    { return }

    hrefs.push( href );
  });

  if (config.verbosity) {
    console.log('>>> Found %d hrefs ...', hrefs.length);
  }

  return hrefs;
}

/**
 *  Given a set of URLs, possibly reletive to a source, fetch each and store
 *  in the given directory.
 *
 *  @method fetch_urls
 *  @param  [config]                Fetch configuration {Object};
 *  @param  [config.outPath = null] A specific output path, overriding the
 *                                  default cache  {String};
 *  @param  [config.force = false]  If truthy, fetch even if the output file
 *                                  already exists {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *  @param  source_url              The URL (origin) of the source page
 *                                  {String};
 *  @param  urls                    The set of urls {Array[String]};
 *
 *  @return A promise for results {Promise};
 *  @private
 */
async function _fetch_urls( config, source_url, urls ) {
  const origin  = (new URL( source_url )).origin;

  urls.forEach( async url => {
    // URLs we process will be relative to `origin`
    if (url[0] !== '/') { return }

    const fileName  = Path.basename( url );
    const outPath   = Path.resolve( config.outPath, fileName );
    const isCached  = Fs.existsSync( outPath );

    if (config.force || ! isCached) {
      if (config.verbosity > 1) {
        console.log('>>> Fetch %s ...', url);
      }

      const res     = await fetch( origin + url );
      const stream  = Fs.createWriteStream( outPath );

      await finished( Readable.fromWeb(res.body).pipe( stream ));

    } else if (config.verbosity > 1) {
      console.log('>>> Use existing cache: %s', outPath);

    }

  });
}
/* Private helpers }
 ****************************************************************************/

module.exports = {
  version   : fetch_version,
};
