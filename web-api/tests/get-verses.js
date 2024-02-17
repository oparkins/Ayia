#!/usr/bin/env node
const Books = require('../lib/books');

const tests = [
  { book:'GEN', expect: 50 },
  { book:'EXO', expect: 40 },
  { book:'LEV', expect: 27 },
  { book:'NUM', expect: 36 },
  { book:'DEU', expect: 34 },
  { book:'JOS', expect: 24 },
  { book:'JDG', expect: 21 },
  { book:'RUT', expect: 4 },
  { book:'1SA', expect: 31 },
  { book:'2SA', expect: 24 },
  { book:'1KI', expect: 22 },
  { book:'2KI', expect: 25 },
  { book:'1CH', expect: 29 },
  { book:'2CH', expect: 36 },
  { book:'EZR', expect: 10 },
  { book:'NEH', expect: 13 },
  { book:'EST', expect: 10 },
  { book:'JOB', expect: 42 },
  { book:'PSA', expect: 150 },
  { book:'PRO', expect: 31 },
  { book:'ECC', expect: 12 },
  { book:'SNG', expect: 8 },
  { book:'ISA', expect: 66 },
  { book:'JER', expect: 52 },
  { book:'LAM', expect: 5 },
  { book:'EZK', expect: 48 },
  { book:'DAN', expect: 12 },
  { book:'HOS', expect: 14 },
  { book:'JOL', expect: 3 },
  { book:'AMO', expect: 9 },
  { book:'OBA', expect: 1 },
  { book:'JON', expect: 4 },
  { book:'MIC', expect: 7 },
  { book:'NAM', expect: 3 },
  { book:'HAB', expect: 3 },
  { book:'ZEP', expect: 3 },
  { book:'HAG', expect: 2 },
  { book:'ZEC', expect: 14 },
  { book:'MAL', expect: 4 },
  { book:'MAT', expect: 28 },
  { book:'MRK', expect: 16 },
  { book:'LUK', expect: 24 },
  { book:'JHN', expect: 21 },
  { book:'ACT', expect: 28 },
  { book:'ROM', expect: 16 },
  { book:'1CO', expect: 16 },
  { book:'2CO', expect: 13 },
  { book:'GAL', expect: 6 },
  { book:'EPH', expect: 6 },
  { book:'PHP', expect: 4 },
  { book:'COL', expect: 4 },
  { book:'1TH', expect: 5 },
  { book:'2TH', expect: 3 },
  { book:'1TI', expect: 6 },
  { book:'2TI', expect: 4 },
  { book:'TIT', expect: 3 },
  { book:'PHM', expect: 1 },
  { book:'HEB', expect: 13 },
  { book:'JAS', expect: 5 },
  { book:'1PE', expect: 5 },
  { book:'2PE', expect: 3 },
  { book:'1JN', expect: 5 },
  { book:'2JN', expect: 1 },
  { book:'3JN', expect: 1 },
  { book:'JUD', expect: 1 },
  { book:'REV', expect: 22 },
];

tests.forEach( test => {
  const count = Books.getChapters( test.book );

  if (count !== test.expect) {
    console.error('*** %s: %d !== %d',
                  test.book, count, expect);

  } else {
    console.log('=== %s: %d', test.book, count);
  }
});

