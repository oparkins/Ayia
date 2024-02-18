const Assert        = require('assert').strict;
const Path          = require('path');
const { read_csv }  = require('./lib/helpers');
const Books         = require('../lib/books');
const locations     = require('./fixtures/book-locations');

describe('books.getBooks', () => {
  locations.forEach( test => {
    test.names.forEach( loc => {
      const expNames  = test.books;
      const expLen    = expNames.length;

      it( `${loc}: expect ${expLen} books`, () => {
        const books = Books.getBooks( loc );

        Assert.equal( books.length, expLen, 'incorrect number of books' );

        const names = books.map( book => book.abbr );
        Assert.deepStrictEqual( names, expNames, 'names mismatch' );
      });

    });
  });
});
