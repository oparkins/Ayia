/**
 *  Interlinear handler for the Bearean Standard Bible.
 *
 */
const { fetch }   = require('./fetch');
const { parse }   = require('./parse');
const { toJson }  = require('./toJson');
const { Version } = require('./version');

// Attach the handlers and export 
Version.handler = {
  fetch,
  parse,
  toJson,
};

module.exports = {
  Version,
};
