const Util  = require('util');

/**
 *  Generate an inspected version of theh given object.
 *  @method inspect
 *  @param  [depth = 4]     The object depth to traverse {Number}
 *  @param  [colors = true] Colorize the output {Boolean}
 *
 *  @return A string version of `obj` {String};
 */
function inspect( obj, depth=4, colors=true ) {
  const opts  = {
    showHidden      : false,
    depth           : depth,
    colors          : colors,
    maxStringLength : 120,
    breakLength     : 80,
    compact         : 10,
  };

  return Util.inspect( obj, opts );
}

module.exports = { inspect };
