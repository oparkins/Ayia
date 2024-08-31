const Util  = require('util');
const Chalk = require('chalk');

/**
 *  Generate an inspected version of the given object.
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

const Format_RE = /%(?<slot>[difjoOc%]|s(?::(?<chalk>[a-zA-Z.]+))?)/g;

/**
 *  Printf with chalk colors.
 *
 *  @method printf
 *  @param  format      The format string {String};
 *  @param  ...         Values for format slots {Mixed};
 *
 *  Format slots:
 *    %s: String will be used to convert all values except BigInt,
 *        Object and -0. BigInt values will be represented with an n and
 *        Objects that have no user defined toString function are inspected
 *        using util.inspect() with options
 *          { depth: 0, colors: false, compact: 3 }.
 *
 *        In addition, chalk modifiers may be specified following a ':'
 *          %s:red.bgWhite.bold
 *
 *    %d: Number will be used to convert all values except BigInt and Symbol.
 *    %i: parseInt(value, 10) is used for all values except BigInt and Symbol.
 *    %f: parseFloat(value) is used for all values expect Symbol.
 *
 *    %j: JSON. Replaced with the string '[Circular]' if the argument contains
 *        circular references.
 *
 *    %o: Object. A string representation of an object with generic JavaScript
 *        object formatting. Similar to util.inspect() with options
 *          { showHidden: true, showProxy: true }.
 *        This will show the full object including non-enumerable properties
 *        and proxies.
 *
 *    %O: Object. A string representation of an object with generic JavaScript
 *        object formatting. Similar to util.inspect() without options. This
 *        will show the full object not including non-enumerable properties and
 *        proxies.
 *
 *    %c: CSS. This specifier is ignored and will skip any CSS passed in.
 *
 *    %%: single percent sign ('%'). This does not consume an argument.
 *
 *  @return The number of characters output {Number};
 */
function printf( format, ...args ) {
  const matches     = [ ...format.matchAll( Format_RE ) ];
  const output      = [];
  let   consumed    = 0;

  /*
  console.log('format[ %s ], matches:', format, inspect( matches ));
  // */

  matches.forEach( (match, idex) => {
    const arg   = args[ idex ];
    const item  = match[0];
    const input = match.input;
    const index = match.index;
    const slot  = match.groups.slot;

    if (consumed < index) {
      /* Include any non-format text from the format string that occurs before
       * this slot.
       */
      const str = input.slice( consumed, index );
      output.push( str );

      consumed = index + item.length;
    }

    /*
    console.log('>>> match %d: arg[ %s ], item[ %s ], input[ %s ], '
                +       'index[ %d ], slot[ %s ]',
                idex, arg, item, input, index, slot);
    // */

    let out = arg;

    // Format the current argument according to the formatter in this slot
    switch( slot[0] ) {
      case 's': {
        const format_opts = {
          depth       : 0,
          colors      : true,
          compact     : 3,
          breakLength : 80,
        };

        if (match.groups.chalk) {
          format_opts.colors = false;

          const arg_str = Util.formatWithOptions( format_opts, '%s', arg );

          // Apply chalk operations passing the argument to the final
          const ops = match.groups.chalk.split('.');
          const fin = ops.pop();
          const pre = ops.reduce( (self,op) => {
            return self[op];
          }, Chalk);

          out = pre[fin]( arg_str );

        } else {
          out = Util.formatWithOptions( format_opts, '%s', arg );

        }
      } break;

      case 'j':
        out = Util.format( '%j', arg );
        break;

      case 'o': {
        const format_opts = {
          depth       : 4,
          compact     : 3,
          breakLength : 80,
          showHidden  : true,
          showProxy   : true,
          colors      : true,
        };

        out = Util.formatWithOptions( format_opts, '%o', arg );
      } break;

      case 'O': {
        const format_opts = {
          depth       : 4,
          compact     : 3,
          breakLength : 80,
          showHidden  : false,
          showProxy   : false,
          colors      : true,
        };

        out = Util.formatWithOptions( format_opts, '%O', arg );
      } break;

      case 'd':
      case 'i':
      case 'f':
      case 'c': {
        const format_opts = { colors: true };

        out = Util.formatWithOptions( format_opts, `%${slot}`, arg);

      } break;

      case '%':
        out = '%';
        break;

      default:
        out = text;
        break;
    }

    output.push( out );
  });

  process.stdout.write( output.join('') );

  //console.log( '%s', Util.formatWithOptions( format_opts, ...args ));
}

/**
 *  Success output (to stdout)
 *
 *  @method success
 *  @param  format      The format string {String};
 *  @param  ...         Values for format slots {Mixed};
 *
 *  @return void
 */
function success( format, ...args ) {
  const out = Util.format( format, ...args );

  process.stdout.write( Chalk.green( out ) );
}

/**
 *  Info output (to stdout)
 *
 *  @method info
 *  @param  format      The format string {String};
 *  @param  ...         Values for format slots {Mixed};
 *
 *  @return void
 */
function info( format, ...args ) {
  const out = Util.format( format, ...args );

  process.stdout.write( Chalk.cyan( out ) );
}

/**
 *  Warning output (to stderr)
 *
 *  @method warn
 *  @param  format      The format string {String};
 *  @param  ...         Values for format slots {Mixed};
 *
 *  @return void
 */
function warn( format, ...args ) {
  const out = Util.format( format, ...args );

  process.stderr.write( Chalk.yellow( out ) );
}

/**
 *  Error output (to stderr)
 *
 *  @method error
 *  @param  format      The format string {String};
 *  @param  ...         Values for format slots {Mixed};
 *
 *  @return void
 */
function error( format, ...args ) {
  const out = Util.format( format, ...args );

  process.stderr.write( Chalk.red( out ) );
}

/**
 *  Invoke console.log
 *
 *  @method log
 *  @param  format      The format string {String};
 *  @param  ...         Values for format slots {Mixed};
 *
 *  @return void
 */
function log( format, ...args ) {
  console.log( format, ...args );
}

module.exports = { inspect, printf, success, info, warn, error, log };
