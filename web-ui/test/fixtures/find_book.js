export const tests  = [
  { val: 'John',            expect: 'JHN' },
  { val: 'JHN',             expect: 'JHN' },
  { val: 'Joh.',            expect: 'JHN' },

  { val: 'Rev.',            expect: 'REV' },

  { val: 'Gen. 1:1',        expect: 'GEN' },
  { val: 'Colossions 1:17', expect: 'COL' },
  { val: '1 John 1:1',      expect: '1JN' },
  { val: 'Rev. 1:4, 8, 17', expect: 'REV' },

  { val: 'Heb. 4:12',       expect: 'HEB' },
  { val: 'Heb 4:12',        expect: 'HEB' },
  { val: 'Hebrews 4:12',    expect: 'HEB' },

  { val: 'Phil 2:6',        expect: 'PHP' },
  { val: 'Phil. 2:6',       expect: 'PHP' },
  { val: 'Philippians 2:6', expect: 'PHP' },

  { val: 'Not a book',      expect: null },
];
