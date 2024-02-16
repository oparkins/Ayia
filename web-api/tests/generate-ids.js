#!/usr/bin/env node
const Parse     = require('../api/parse');
const Generate  = require('../api/generate');

const tests = [
  'GEN.1',
  'GEN.1.2',
  'GEN.1.2-3',
  'GEN.1.2-3.4',

  // Swap
  'GEN.1.3-2',
  'GEN.3.4-1.2',
  'GEN.3.1-2.4',
];

const version = {
  abbreviation: 'MOCK',
  books: {
    GEN: {
      verses: [
        /* Verse counts for chapters:
         *   1   2   3   4   5   6   7   8   9 */
        0,  31, 25, 24, 26, 32, 22, 24, 22, 29,
        32, 32, 20, 18, 24, 21, 16, 27, 33, 38,
        18, 34, 24, 20, 67, 34, 35, 46, 22, 35,
        43, 55, 32, 20, 31, 29, 43, 36, 30, 23,
        23, 57, 38, 34, 34, 28, 34, 31, 22, 33,
        26,
      ],
    }
  }
};

/* Reflect 'id' into `versions.books` as will be done by
 * `api/parse:parse_ref()`
 */
version.books.GEN.id = 'GEN';

tests.forEach( test => {
  const ref = Parse.reference( test, version );
  const ids = Generate.verse_ids( ref );

  console.log('%s : %s', test.padEnd(20, ' '), _inspect(ids));
});

function _inspect( obj ) {
  const Util  = require('util');
  const opts  = {
    showHidden      : false,
    depth           : 4,
    colors          : true,
    maxStringLength : 120,
    breakLength     : 80,
    compact         : 5,
  };

  return Util.inspect( obj, opts );
}
