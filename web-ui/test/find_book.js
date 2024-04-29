import * as Assert    from 'assert/strict';
import { readFile }   from 'fs/promises';
import { find_book }  from '../src/lib/verse_ref.js';
import { tests }      from './fixtures/find_book.js';

const versions = JSON.parse(
  await readFile(
    new URL('./fixtures/versions.json', import.meta.url)
  )
);

describe('find_book', () => {
  tests.forEach( test => {
    if (test.expect == null) {
      it( `should NOT find '${test.val}'`, () => {
        const book  = find_book( test.val, versions );

        Assert.equal( book, undefined );
      });

    } else {
      it( `should find '${test.val}'`, () => {
        const book  = find_book( test.val, versions );

        Assert.notEqual( book, null );
        Assert.notEqual( book, undefined );

        Assert.equal( book.abbr, test.expect );
      });
    }
  });
});
