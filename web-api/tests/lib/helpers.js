const Fs  = require('fs');

/**
 *  Read a CSV file and return a matrix of data.
 *
 *  @method read_csv
 *  @param  data_path The path to the target file {String};
 *
 *  @return - On success, the data as an array per line containing an array of
 *                        fields {Array};
 *          - On failure, throws an error {Error};
 */
function read_csv( data_path ) {
  const data  = Fs.readFileSync( data_path, 'utf8' );
  const res   = [];
  const lines = data.split('\n');

  lines.forEach( (line,idex) => {
    if (line == null || line.length < 1) {
      return;
    }

    if (line[0] === '#') {
      if (res.metadata == null) {
        res.metadata = line.slice(1);
      }
      return;
    }

    const fields  = line.split(',');

    res.push( fields );
  });

  return res;
}

module.exports = { read_csv }
