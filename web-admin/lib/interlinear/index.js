/**
 *  Interlinear utilities.
 *
 *  Handlers should provide:
 *    fetch( config )
 *    parse( config )
 *    toJson( config )
 *
 *  Each can accept a `config` of the form:
 *    { inPath    : A specific input path [pre-configured location] {String};
 *      outPath   : A specific output path [pre-configured location] {String};
 *      force     : If truthy, fetch even if the output file already exists
 *                  [false] {Boolean};
 *      verbosity : Verbosity level [0] {Number};
 *    }
 */
const Versions = require('./versions');

module.exports	= {
  ...Versions,
};
