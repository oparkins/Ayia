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

tests.forEach( test => {
  const ref = Parse.reference( test );
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
