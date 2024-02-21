const Path  = require('path');

// Shared constants
const YVERS_URL   = 'https://www.bible.com';
const PATH_CACHE  = Path.resolve( __dirname, '..', '..', 'cache' );

module.exports  = {
  YVERS_URL,

  PATH_CACHE,
};
