#!/usr/bin/env node
const Books = require('../lib/books');

const tests = [
  { book:'GEN', chapter: 1,   expect: 31 },
  { book:'PSA', chapter: 119, expect: 176 },
  { book:'PRO', chapter: 5,   expect: 23 },
  { book:'MAT', chapter: 12,  expect: 50 },
  { book:'JHN', chapter: 3,   expect: 36 },
  { book:'1TH', chapter: 1,   expect: 10 },
  { book:'3JN', chapter: 1,   expect: 15 },
  { book:'REV', chapter: 7,   expect: 17 },
];

tests.forEach( test => {
  const count = Books.getVerses( test.book, test.chapter );

  if (count !== test.expect) {
    console.error('*** %s %s: %d !== %d',
                  test.book, String(test.chapter).padStart(3, ' '),
                  count, test.expect);

  } else {
    console.log('=== %s %s: %d',
                  test.book, String(test.chapter).padStart(3, ' '), count);
  }
});
