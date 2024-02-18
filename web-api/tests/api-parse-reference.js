const Assert  = require('assert').strict;
const Parse   = require('../api/parse');
const tests   = require('./fixtures/api-parse-reference');

describe('api.parse.reference', () => {
  tests.forEach( test => {

    it( `${test.ref}`, () => {
      const res = Parse.reference( test.ref );

      if (test.error) {
        Assert( res instanceof Error, 'expected an error instance' );

      } else {
        Assert.equal( res.book.abbr, test.expect.book, 'incorrect book' );

        res.book = res.book.abbr;
        Assert.deepStrictEqual( res, test.expect, 'incorrect result' );
      }
    });
  });
});
