const Versions  = require('./versions');
const Books     = require('./books');

module.exports  = {
  getVersions:  Versions.getVersions,
  findVersion:  Versions.findVersion,
  getVersion:   Versions.getVersion,

  getBooks:     Books.getBooks,
  getBook:      Books.getBook,
};
