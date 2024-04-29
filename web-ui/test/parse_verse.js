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

      Assert.notEqual( verse, null );
      Assert.notEqual( verse, undefined );

      Assert.equal( verse.book,     test.expect.book,     'Book mismatch' );
      Assert.equal( verse.chapter,  test.expect.chapter,  'Chapter mismatch' );
      Assert.equal( verse.verse,    test.expect.verse,    'Verse mismatch' );
      Assert.deepEqual( verse.verses, test.expect.verses, 'Verses mismatch' );

      if (test.expect.ui_ref) {
        Assert.equal( verse.ui_ref, test.expect.ui_ref,   'ui_ref mismatch' );
      }
      if (test.expect.url_ref) {
        Assert.equal( verse.url_ref, test.expect.url_ref, 'url_ref mismatch' );
      }
    });
  });
});
