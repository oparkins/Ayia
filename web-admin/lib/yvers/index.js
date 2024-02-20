/**
 *  YouVersion (yvers) utilities.
 *
 */
const Versions  = require('./versions');
const Parse     = require('./parse');

module.exports  = {
  getVersions:  Versions.getVersions,
  findVersion:  Versions.findVersion,
  getVersion:   Versions.getVersion,

  toJson:       Parse.toJson,
};
