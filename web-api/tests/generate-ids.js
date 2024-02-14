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
      id: 'GEN',
      '1': { min: 1, max: 31 },
      '2': { min: 1, max: 25 },
      '3': { min: 1, max: 24 },
      '4': { min: 1, max: 26 },
      '5': { min: 1, max: 32 },
      '6': { min: 1, max: 22 },
      '7': { min: 1, max: 24 },
      '8': { min: 1, max: 22 },
      '9': { min: 1, max: 29 },
      '10': { min: 1, max: 32 },
      '11': { min: 1, max: 32 },
      '12': { min: 1, max: 20 },
      '13': { min: 1, max: 18 },
      '14': { min: 1, max: 24 },
      '15': { min: 1, max: 21 },
      '16': { min: 1, max: 16 },
      '17': { min: 1, max: 27 },
      '18': { min: 1, max: 33 },
      '19': { min: 1, max: 38 },
      '20': { min: 1, max: 18 },
      '21': { min: 1, max: 34 },
      '22': { min: 1, max: 24 },
      '23': { min: 1, max: 20 },
      '24': { min: 1, max: 67 },
      '25': { min: 1, max: 34 },
      '26': { min: 1, max: 35 },
      '27': { min: 1, max: 46 },
      '28': { min: 1, max: 22 },
      '29': { min: 1, max: 35 },
      '30': { min: 1, max: 43 },
      '31': { min: 1, max: 55 },
      '32': { min: 1, max: 32 },
      '33': { min: 1, max: 20 },
      '34': { min: 1, max: 31 },
      '35': { min: 1, max: 29 },
      '36': { min: 1, max: 43 },
      '37': { min: 1, max: 36 },
      '38': { min: 1, max: 30 },
      '39': { min: 1, max: 23 },
      '40': { min: 1, max: 23 },
      '41': { min: 1, max: 57 },
      '42': { min: 1, max: 38 },
      '43': { min: 1, max: 34 },
      '44': { min: 1, max: 34 },
      '45': { min: 1, max: 28 },
      '46': { min: 1, max: 34 },
      '47': { min: 1, max: 31 },
      '48': { min: 1, max: 22 },
      '49': { min: 1, max: 33 },
      '50': { min: 1, max: 26 },
      range: { min: 1, max: 50 }
    }
  }
};

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
