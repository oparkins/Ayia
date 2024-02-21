const Path  = require('path');

// Shared constants
const TABLES_URL = "https://bereanbible.com/bsb_tables.xlsx"
const TABLES_FILE = "bsb_tables.xlsx"
const PATH_CACHE  = Path.resolve( __dirname, '..', '..', '..', 'cache' );
const PATH_XLSX   = Path.join( PATH_CACHE, TABLES_FILE );
const PATH_CSV    = Path.join( PATH_CACHE,
                                Path.basename(TABLES_FILE, '.xlsx')+'.csv' );

module.exports  = {
  TABLES_URL,
  TABLES_FILE,
  PATH_CACHE,
  PATH_XLSX,
  PATH_CSV,
};
