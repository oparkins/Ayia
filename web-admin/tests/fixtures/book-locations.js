const locations = [
  { names: [ 'Old Testament', 'old test', 'oldtest', 'ot' ],
    books: [
      'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
      '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
      'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
      'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL',
    ],
  },
  { names: [ 'New Testament', 'new test', 'newtest', 'nt' ],
    books: [
      'MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH',
      'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS',
      '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV',
    ],
  },
  { names: [ 'Deuterocanon', 'deutero canon', 'deuterocanon', 'dc' ],
    books: [
      'TOB', 'JDT', 'WIS', 'SIR', 'BAR', 'ESG', 'LJE', 'S3Y', 'SUS', 'BEL',
      '1MA', '2MA', '3MA', '4MA', '1ES', '2ES', 'MAN', 'PS2', 'ODA', 'PSS',
      'EZA', '5EZ', '6EZ', 'DAG', 'PS3', '2BA', 'LBA', 'JUB', 'ENO', '2MQ',
      '3MQ', 'REP', 'LAO',
    ],
  },
  { names: [ 'Non scripture', 'non script', 'nonscript', 'ns' ],
    books: [
      'XXA', 'XXB', 'XXC', 'XXD', 'XXE', 'XXF', 'XXG', 'FRT', 'BAK', 'OTH',
      'INT', 'CNC', 'GLO', 'TDX', 'NDX',
    ],
  },
];

module.exports = locations;
