/**
 *  Present usage information from a configured Yargs parser and exit.
 *  @method yargs_usage
 *  @param  yaargs  The configured parser {Yargs};
 *
 *  @return void  (exits the process)
 *  @private
 */
function yargs_usage( yargs ) {
	yargs.showHelp();

  process.exit(-1);
}

module.exports = {
  yargs:  yargs_usage,
};
