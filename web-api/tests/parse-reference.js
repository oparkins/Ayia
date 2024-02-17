#!/usr/bin/env node
const Parse = require('../api/parse');

const refs  = [
  'GEN',
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
      id: 'GEN',
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

refs.forEach( ref => {
  const res = Parse.reference( ref, version );
  if (res instanceof Error) {
    console.error('%s : Error %s', ref.padEnd(20, ' '), res.message);

  } else {
    const out = {
      version : res.version.abbreviation,
      book    : res.book.id,
      from    : res.from,
      to      : res.to,
    };
    console.log('%s : %s', ref.padEnd(20, ' '), _inspect(out));
  }
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
