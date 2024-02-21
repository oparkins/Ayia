const Fs  = require('fs/promises');

/**
 *  Create the given directory (path) if it does not yet exist.
 *  @method make_dir
 *  @param  path  The path to the target directory {String};
 *
 *  @return A promise for results {Promise};
 *          - on success, the first directory path created {String};
 *          - on failure, an error {Error};
 */
async function make_dir( path ) {
  let doMake  = false;
  let error;

  try {
    const stats = await Fs.stat( path );

    if (! stats.isDirectory()) {
      error = new Error('path exists but is not a directory');

    } // else path exists and is a directory

  } catch(err) {
    if (err.code === 'ENOENT') {
      // Path does not yet exist
      doMake = true;

    } else {
      error = err;
    }
  }

  if (error)  { throw error }

  const create_opts  = {
    mode      : 0o770,
    recursive : true,
  };

  const first_dir = await Fs.mkdir( path, create_opts );

  return (first_dir || path);
}

module.exports = { make_dir };
