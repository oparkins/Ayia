const Assert  = require('assert').strict;
const Books   = require('../lib/books');
const tests   = require('./fixtures/book-names');

describe('books.nameToABBR', () => {
  tests.forEach( (test, idex) => {
    it( `${test.str} should resolve to ${test.expect}`, () => {
      const abbr  = Books.nameToABBR( test.str );

      Assert.equal( abbr, test.expect );
    });
  });
});
