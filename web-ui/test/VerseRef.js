import * as Assert      from 'assert/strict';
import { readFile }     from 'fs/promises';
import { VerseRef }     from '../src/lib/verse_ref.js';
import { tests }        from './fixtures/VerseRef.js';

const versions = JSON.parse(
  await readFile(
    new URL('./fixtures/versions.json', import.meta.url)
  )
);

describe('VerseRef', () => {

  tests.forEach( test => {
    const msg = (test.msg || `should handle ${test.val}`);

    it( msg, () => {
      const apply_bounds  = (test.bounds == null ? true : test.bounds);
      const ref           = new VerseRef( test.val, versions, apply_bounds );

      /*
      console.log('>>> %s (apply_bounds: %s) => ',
                  test.val, String(apply_bounds), ref);
      // */

      Assert.equal( ref.is_valid, test.expect.is_valid,
                    'Validation mismatch: '
                      + JSON_stringify_ref( ref ));
      if (ref.book) {
        Assert.equal( ref.book.abbr, test.expect.book_abbr,
                      'Book mismatch: '
                        + `${ref.book.abbr} !== ${test.expect.book_abbr}: `
                        + JSON_stringify_ref( ref ));
      } else {
        Assert.equal( null, test.expect.book_abbr,
                      'Book mismatch: should be null: '
                        + JSON_stringify_ref( ref ));
      }

      Assert.equal( ref.chapter, test.expect.chapter,
                    'Chapter mismatch: '
                      + `${ref.chapter} !== ${test.expect.chapter}: `
                      + JSON_stringify_ref( ref ));
      Assert.deepEqual( ref.verses, test.expect.verses,
                    'Verses mismatch: '
                      + `${ref.verses} !== ${test.expect.verses}: `
                      + JSON_stringify_ref( ref ));

      if (test.expect.ui_ref) {
        Assert.equal( ref.ui_ref, test.expect.ui_ref,
                      'ui_ref mismatch: '
                        + `${ref.ui_ref} !== ${test.expect.ui_ref}: `
                        + JSON_stringify_ref( ref ));
      }
      if (test.expect.url_ref) {
        Assert.equal( ref.url_ref, test.expect.url_ref,
                      'url_ref mismatch: '
                        + `${ref.url_ref} !== ${test.expect.url_ref}: `
                        + JSON_stringify_ref( ref ));
      }
    });
  });
});

describe('VerseRef.update_verses', () => {
  it( 'Should extend verse range: Romans 8:3 to Romans 8:3-4', () => {
    const expect  = {
      is_valid  : true,
      book_abbr : 'ROM',
      chapter   : 8,
      verses    : [ 3,4 ],
      ui_ref    : 'Romans 8:3-4',
      url_ref   : 'ROM.008.003-004',
    };
    const ref     = new VerseRef( 'Romans 8:3', versions );

    ref.update_verses( [3,'4'] );

      Assert.equal( ref.is_valid, expect.is_valid,
                    'Validation mismatch: '
                      + JSON_stringify_ref( ref ));
      Assert.equal( ref.book.abbr, expect.book_abbr,
                    'Book mismatch: '
                      + `${ref.book.abbr} !== ${expect.book_abbr}: `
                      + JSON_stringify_ref( ref ));
      Assert.equal( ref.chapter, expect.chapter,
                    'Chapter mismatch: '
                      + `${ref.chapter} !== ${expect.chapter}: `
                      + JSON_stringify_ref( ref ));
      Assert.deepEqual( ref.verses, expect.verses,
                    'Verses mismatch: '
                      + `${ref.verses} !== ${expect.verses}: `
                      + JSON_stringify_ref( ref ));

      Assert.equal( ref.ui_ref, expect.ui_ref,
                    'ui_ref mismatch: '
                      + `${ref.ui_ref} !== ${expect.ui_ref}: `
                      + JSON_stringify_ref( ref ));
      Assert.equal( ref.url_ref, expect.url_ref,
                    'url_ref mismatch: '
                      + `${ref.url_ref} !== ${expect.url_ref}: `
                      + JSON_stringify_ref( ref ));
  });
  it( 'Should extend verse range: John 3:16-18 to John 3:16-22', () => {
    const expect  = {
      is_valid  : true,
      book_abbr : 'JHN',
      chapter   : 3,
      verses    : [ 16,17,18,19,20,21,22 ],
      ui_ref    : 'John 3:16-22',
      url_ref   : 'JHN.003.016-022',
    };
    const ref     = new VerseRef( 'John 3:16-18', versions );

    ref.update_verses( [16,17,18,19,20,21,22] );



      Assert.equal( ref.is_valid, expect.is_valid,
                    'Validation mismatch: '
                      + JSON_stringify_ref( ref ));
      Assert.equal( ref.book.abbr, expect.book_abbr,
                    'Book mismatch: '
                      + `${ref.book.abbr} !== ${expect.book_abbr}: `
                      + JSON_stringify_ref( ref ));
      Assert.equal( ref.chapter, expect.chapter,
                    'Chapter mismatch: '
                      + `${ref.chapter} !== ${expect.chapter}: `
                      + JSON_stringify_ref( ref ));
      Assert.deepEqual( ref.verses, expect.verses,
                    'Verses mismatch: '
                      + `${ref.verses} !== ${expect.verses}: `
                      + JSON_stringify_ref( ref ));

      Assert.equal( ref.ui_ref, expect.ui_ref,
                    'ui_ref mismatch: '
                      + `${ref.ui_ref} !== ${expect.ui_ref}: `
                      + JSON_stringify_ref( ref ));
      Assert.equal( ref.url_ref, expect.url_ref,
                    'url_ref mismatch: '
                      + `${ref.url_ref} !== ${expect.url_ref}: `
                      + JSON_stringify_ref( ref ));
  });
});

/**
 *  Generate a simplified JSON representation of the given ref.
 *
 *  @method JSON_strinify_ref
 *  @param  ref     The target ref instance {VerseRef};
 *
 *  @return The simplified JSON representation {String};
 */
function JSON_stringify_ref( ref ) {
  const res = {
    is_valid  : ref.is_valid,
    book_abbr : (ref.book && ref.book.abbr),
    chapter   : ref.chapter,
    verses    : ref.verses,
    ui_ref    : ref.ui_ref,
    url_ref   : ref.url_ref,
  };

  return JSON.stringify( res, null, 2);
}
