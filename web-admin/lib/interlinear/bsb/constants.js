const Path  = require('path');

// Shared constants
const TABLES_URL = "https://bereanbible.com/bsb_tables.xlsx"
const TABLES_FILE = "bsb_tables.xlsx"
const PATH_CACHE  = Path.resolve(
                      Path.join( __dirname, '..', '..', '..', 'cache' ) );
const PATH_XLSX   = Path.join( PATH_CACHE, TABLES_FILE );
const PATH_CSV    = Path.join( PATH_CACHE,
                                Path.basename(TABLES_FILE, '.xlsx')+'.csv' );
const PATH_JSON   = Path.join( PATH_CACHE, 'bsb-il.json' );

module.exports  = {
  TABLES_URL,
  TABLES_FILE,
  PATH_CACHE,
  PATH_XLSX,
  PATH_CSV,
  PATH_JSON,
};
