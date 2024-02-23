const Path            = require('path');
const { PATH_CACHE }  = require('../../constants');

// Shared constants
const TABLES_URL  = 'https://bereanbible.com/bsb_tables.xlsx';
const TABLES_FILE = 'BSB-IL.xlsx';
const PATH_XLSX   = Path.join( PATH_CACHE, TABLES_FILE );

module.exports  = {
  PATH_CACHE,

  TABLES_URL,
  TABLES_FILE,

  PATH_XLSX,
};
