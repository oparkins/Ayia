const Assert  = require('assert').strict;
const Xrefs   = require('../versions/yvers/xrefs');
const tests   = require('./fixtures/yvers-xrefs');

describe('yvers.xrefs', () => {
  tests.forEach( (test, idex) => {
    const ref = `${test.version}:${test.usfm}`;
    const state = {
      verbosity : 0,
      version   : test.version,
      usfm      : test.usfm,
    };

    const msg = `${test.type} from ${ref} : ${test.texts}`;
    if (test.actual) {
      // This is a test that will currently generate incorrect results
      it( `:TODO: Improperly parses ${msg}`, () => {
        const res = Xrefs.normalize( state, test.texts );

        //Assert.notDeepEqual( res, test.expect );
        Assert.deepEqual( res, test.actual );
      });

    } else {
      // This is a test that should generate correct results
      it( `Should properly parse ${msg}`, () => {
        const res = Xrefs.normalize( state, test.texts );

        Assert.deepEqual( res, test.expect );
      });
    }
  });
});
