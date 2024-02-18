const Assert        = require('assert').strict;
const Path          = require('path');
const { read_csv }  = require('./lib/helpers');
const Books         = require('../lib/books');

describe('boooks.getChapters', () => {
  const fixture_path  = Path.join( __dirname, 'fixtures/verse-counts.csv' );
  let   lines;
  try {
    lines = read_csv( fixture_path );

    console.log('=== Read %d lines of fixture data', lines.length);

  } catch(err) {
    //console.error('*** Error reading fixture:', err.message);
    console.error('*** Error reading fixture:', err);
    return;
  }

  lines.forEach( (fields, idex) => {
    const abbr        = fields.shift();
    const totChapters = parseInt( fields.shift() );
    const totVerses   = parseInt( fields.shift() );

    it( `${abbr}: fixture data`, () => {
      // Validate the fixture data
      Assert.equal( totChapters, fields.length,
                      `${abbr} expect ${totChapters} chapters, `
                      + `only have ${fields.length} verse counts`);
    });

    it( `${abbr}: getBook`, () => {
      const book = Books.getBook( abbr );

      Assert( book != null, `Cannot locate book ${abbr}` );
    });

    it( `${abbr}: expect ${totChapters} chapters`, () => {
      const numChapters = Books.getChapters( abbr );

      Assert.equal( numChapters, totChapters );
    });

    fields.forEach( (fieldVal, chapNum) => {
      const expVerses = parseInt( fieldVal );

      it( `${abbr}.${chapNum+1}: expect ${expVerses} verses`, () => {
        const numVerses = Books.getVerses( abbr, chapNum+1 );

        Assert.equal( numVerses, expVerses );
      });
    });
  });

});
