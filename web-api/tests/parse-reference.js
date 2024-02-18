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

refs.forEach( ref => {
  const res = Parse.reference( ref );
  if (res instanceof Error) {
    console.error('%s : Error %s', ref.padEnd(20, ' '), res.message);

  } else {
    const out = {
      book    : res.book.abbr,
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
