const Fs          = require('fs');
const Yaml        = require('js-yaml');
const deep_merge  = require('./deep_merge');

/**
 *  Load a configuration based upon incoming arguments.
 *  @method load_config
 *  @param  args    The incoming arguments (Yargs);
 *
 *  @return The generated configuration {Object};
 */
function load_config( args ) {
  const config    = {};

  if (args.config) {
    const data  = Yaml.load( Fs.readFileSync( args.config, 'utf8' ) );

    Object.assign( config, data );
  }

  // Include command line over-rides
  if (args.verbosity) {
    config.verbosity = args.verbosity;
  }
  if (args.auth) {
    if (config.auth == null) { config.auth = {} }
    deep_merge( config.auth, args.auth );
  }
  if (args.service) {
    if (config.service == null) { config.service = {} }
    deep_merge( config.service, args.service );
  }

  // Expand any 'file:' values
  _expand_values( config );

  return config;
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Recursivly iterate through the given object looking for string-based values
 *  that should be expanded.
 *  @method _expand_values
 *  @param  obj   The target object {Object};
 *
 *  We will expand string-based values that begin with:
 *    'file:'   the value is replaced with the contents of the target file;
 *    'env:'    the value is replaced with the value of the named environment
 *              variable;
 *
 *  @return The updated object {Object};
 *  @private
 */
function _expand_values( obj ) {
  if (obj == null || typeof(obj) !== 'object') { return obj }

  Object.entries( obj ).forEach( ([key,val]) => {
    const type  = typeof(val);

    if (val != null && type === 'object') {
      obj[key] = _expand_values( val );

    } else if (type === 'string') {
      if (val.startsWith('env:')) {
        /* Attempt to replace this 'env:%name%' value with the value of the
         * referneced environment variable.
         */
        const name  = val.slice(4);

        if (process.env.hasOwnProperty(name)) {
          val = obj[key] = process.env[ name ];

        } else {
          const message = [ 'cannot expand val[ ', val ,' ] ',
                            'for key [ ', key, ' ]:\n',
                            '  No such environment variable[ ', name ,' ]',
                          ].join('')

          console.error('load_config: %s', message);
          return;

          //throw new Error( message );
        }
      }

      /* Process 'file:' AFTER 'env:' to allow environment-based values to
       * cascade to file content.
       *
       * For example:
       *    test: 'env:TEST'                Where TEST = 'file:/tmp/test.txt'
       *      => test: 'file:/tmp/test.txt' Where /tmp/test.txt = 'Hello world'
       *          => test: 'Hello world'
       */
      if (val.startsWith('file:')) {
        /* Attempt to replace this 'file:%path%' value with the contents of the
         * referenced file.
         */
        const path  = val.slice(5);

        try {
          val = obj[key] = Fs.readFileSync( path, 'utf8' );

        } catch(ex) {
          const message = [ 'cannot expand val[ ', val ,' ] ',
                            'for key [ ', key, ' ]:\n',
                            '  ', ex.message,
                          ].join('')

          console.error('load_config: %s', message);
          return;

          //throw new Error( message );
        }

      }
    }
  });

  return obj;
}

/* Private helpers }
 ****************************************************************************/

module.exports  = load_config;
// vi: ft=javascript
