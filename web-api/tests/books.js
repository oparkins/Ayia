#!/usr/bin/env node
const Books = require('../lib/books');

const tests = [
  'ot', 'oldtest', 'old test', 'old testament',
  'nt', 'newtest', 'new test', 'new testament',
  'dc', 'deuterocanon', 'deutero canon',
  'ns', 'nonscripture', 'non scripture',

  // Multiples
  'ot,nt',  'ot;nt', 'ot|nt', 'ot+nt', 

  // All
  '*',
];

tests.forEach( test => {
  const books = Books.getBooks( test );

  console.log('%s:', test, books);
});
