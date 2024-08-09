/**
 *  PDF handler for the NIV-1984 Bible.
 *
 */
const Fetch       = require('./fetch');
const Extract     = require('./extract');
//const Prepare     = require('./prepare');
const { Version } = require('./version');

// Attach the handlers and export 
Version._handler = {
  fetch   : Fetch.version,
  extract : Extract.version,
  //prepare : Prepare.version,
};

module.exports = {
  Version,
};
