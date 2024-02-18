const Assert    = require('assert').strict;
const Parse     = require('../api/parse');
const Generate  = require('../api/generate');
const tests     = require('./fixtures/api-generate-verse_ids');

describe('api.generate.verse_ids', () => {
  tests.forEach( test => {
    const expRefs = test.expect;
    const expLen  = expRefs.length;

    it( `${test.ref}: expect ${expLen} references`, () => {
      const ref = Parse.reference( test.ref );
      const ids = Generate.verse_ids( ref );

      Assert.equal( ids.length, expLen, 'incorrect number of references' );
      Assert.deepStrictEqual( ids, expRefs, 'references mismatch' );
    });
  });
});
