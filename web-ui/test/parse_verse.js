import * as Assert      from 'assert/strict';
import { readFile }     from 'fs/promises';
import { parse_verse }  from '../src/lib/verse_ref.js';
import { tests }        from './fixtures/parse_verse.js';

const versions = JSON.parse(
  await readFile(
    new URL('./fixtures/versions.json', import.meta.url)
  )
);

describe('parse_verse', () => {

  tests.forEach( test => {
    const msg = (test.msg || `should parse ${test.val}`);

    it( msg, () => {
      const verse = parse_verse( test.val, versions );

      /*
      console.log('>>> %s => ', test.val, verse);
      // */

      Assert.notEqual( verse, null );
      Assert.notEqual( verse, undefined );

      Assert.equal( verse.book,     test.expect.book,
                    'Book mismatch: '
                      + `${verse.book} !== ${test.expect.book}: `
                      + JSON.stringify(verse, null, 2) );
      Assert.equal( verse.chapter,  test.expect.chapter,
                    'Chapter mismatch: '
                      + `${verse.chapter} !== ${test.expect.chapter}: `
                      + JSON.stringify(verse, null, 2) );
      Assert.equal( verse.verse,    test.expect.verse,
                    'Verse mismatch: '
                      + `${verse.verse} !== ${test.expect.verse}: `
                      + JSON.stringify(verse, null, 2) );
      Assert.deepEqual( verse.verses, test.expect.verses,
                    'Verses mismatch: '
                      + `${verse.verses} !== ${test.expect.verses}: `
                      + JSON.stringify(verse, null, 2) );

      if (test.expect.ui_ref) {
        Assert.equal( verse.ui_ref, test.expect.ui_ref,
                      'ui_ref mismatch: '
                        + `${verse.ui_ref} !== ${test.expect.ui_ref}: `
                        + JSON.stringify(verse, null, 2) );
      }
      if (test.expect.url_ref) {
        Assert.equal( verse.url_ref, test.expect.url_ref,
                      'url_ref mismatch: '
                        + `${verse.url_ref} !== ${test.expect.url_ref}: `
                        + JSON.stringify(verse, null, 2) );
      }
    });
  });
});
