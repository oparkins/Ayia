#!/usr/bin/env node
const Parse = require('../api/parse');

const refs  = [
  'NIV',
  'NIV.GEN',
  'NIV.GEN.1',
  'NIV.GEN.1.2',
  'NIV.GEN.1.2-3',
  'NIV.GEN.1.2-3.4',
  'NIV.GEN.1.2-EXO.3.4',

  // Swap
  'NIV.GEN.1.3-2',
  'NIV.GEN.3.4-1.2',
  'NIV.GEN.3.1-2.4',
];

refs.forEach( ref => {
  try {
    console.log('%s : %s', ref.padEnd(20, ' '), Parse.reference( ref ));
  } catch(ex) {
    console.error('Error on [ %s ]: %s', ref, ex.message);
  }
});
