const Versions  = require('./versions');
const Books     = require('./books');
const Parse     = require('./parse');

module.exports  = {
  getVersions:  Versions.getVersions,
  findVersion:  Versions.findVersion,
  getVersion:   Versions.getVersion,

  getBooks:     Books.getBooks,
  getBook:      Books.getBook,

  toJson:       Parse.toJson,
};
