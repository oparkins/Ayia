/**
 *  Filesystem utilities.
 *
 */
const Fs  = require('fs/promises');

/**
 *  Asynchronously check if the given path exists.
 *
 *  @method exists
 *  @param  path    The target path {String};
 *
 *  @return A promise for results {Promise};
 *          - on success, true | false {Boolean};
 *          - on failure, an error {Error};
 */
async function exists( path ) {
  let exists  = false;

  try {
    await Fs.access( path, Fs.constants.F_OK );
    // File exists
    exists = true;

  } catch {
    // File does NOT exist
  }

  return exists;
}

/**
 *  Check if the given path exists as a directory.
 *
 *  @method exists_dir
 *  @param  path  The path to the target directory {String};
 *
 *  @return A promise for results {Promise};
 *          - on success, true | false {Boolean};
 *          - on failure, an error {Error};
 */
async function exists_dir( path ) {
  let exists    = false;
  let existsDir = false;
  let error;

  try {
    const stats = await Fs.stat( path );

    exists    = true;
    existsDir = stats.isDirectory();

  } catch(err) {
    /* 'ENOENT' indicates that the target does not exist and so is not a
     * directory.
     */
    if (err.code !== 'ENOENT') {
      error = err;
    }
  }

  if (error)  { throw error }

  return existsDir;
}

/**
 *  Create the given directory (path) if it does not yet exist.
 *
 *  @method make_dir
 *  @param  path  The path to the target directory {String};
 *
 *  @return A promise for results {Promise};
 *          - on success, the first directory path created {String};
 *          - on failure, an error {Error};
 */
async function make_dir( path ) {
  const existsDir = await exists_dir( path );

  if (existsDir)  { return path }

  // Attempt to create the directory
  const create_opts  = {
    mode      : 0o770,
    recursive : true,
  };

  const first_dir = await Fs.mkdir( path, create_opts );

  return (first_dir || path);
}

module.exports = {
  exists,
  exists_dir,
  make_dir,
};
