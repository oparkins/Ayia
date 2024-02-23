/**
 *  YouVersion (yvers) utilities.
 *
 */
const Fetch   = require('./fetch');
const Extract = require('./extract');
const Prepare = require('./prepare');

module.exports  = {
  fetch   : Fetch,
  extract : Extract,
  prepare : Prepare,

  // short-cuts
  findVersion:  Fetch.find_version,
};
