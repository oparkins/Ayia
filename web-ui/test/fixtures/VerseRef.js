export const tests  = [
  { val   : 'John 3',
    expect: { is_valid: true, book_abbr: 'JHN', chapter: 3, verses : [],
              ui_ref  : 'John 3',
              url_ref : 'JHN.003',
    },
  },
  { val   : 'John 3:16',
    expect: { is_valid: true, book_abbr: 'JHN', chapter: 3, verses : [16],
              ui_ref  : 'John 3:16',
              url_ref : 'JHN.003.016',
    },
  },
  { val   : '1 John 3:16',
    expect: { is_valid: true, book_abbr: '1JN', chapter: 3, verses : [16],
              ui_ref  : '1 John 3:16',
              url_ref : '1JN.003.016',
    },
  },
  { val   : 'Song of Songs 1:2',
    expect: { is_valid: true, book_abbr: 'SNG', chapter: 1, verses : [2],
              ui_ref  : 'Song of Songs 1:2',
              url_ref : 'SNG.001.002',
    },
  },
  { val   : 'Esther 3:4',
    expect: { is_valid: true, book_abbr: 'EST', chapter: 3, verses : [4],
              ui_ref  : 'Esther 3:4',
              url_ref : 'EST.003.004',
    },
  },

  /*************************************************************************/
  { val   : 'John 3:16-17',
    expect: { is_valid: true, book_abbr: 'JHN', chapter: 3, verses : [16,17],
              ui_ref  : 'John 3:16-17',
              url_ref : 'JHN.003.016-017',
    },
  },
  { val   : 'John 3:17-16',
    expect: { is_valid: true, book_abbr: 'JHN', chapter: 3, verses : [16,17],
              ui_ref  : 'John 3:16-17',
              url_ref : 'JHN.003.016-017',
    },
  },
  { val   : 'John 3:16,17',
    expect: { is_valid: true, book_abbr: 'JHN', chapter: 3, verses : [16,17],
              ui_ref  : 'John 3:16-17',
              url_ref : 'JHN.003.016-017',
    },
  },
  { val   : 'John 3:17,16',
    expect: { is_valid: true, book_abbr: 'JHN', chapter: 3, verses : [16,17],
              ui_ref  : 'John 3:16-17',
              url_ref : 'JHN.003.016-017',
    },
  },
  { val   : 'John 3:16-20',
    expect: { is_valid: true, book_abbr : 'JHN',
              chapter : 3,    verses    : [16,17,18,19,20],
              ui_ref  : 'John 3:16-20',
              url_ref : 'JHN.003.016-020',
    },
  },
  { val   : 'John 3:16,20',
    expect: { is_valid: true, book_abbr: 'JHN', chapter: 3, verses : [16,20],
              ui_ref  : 'John 3:16,20',
              url_ref : 'JHN.003.016,020',
    },
  },
  { val   : 'John 3:16,18,20',
    expect: { is_valid: true, book_abbr : 'JHN',
              chapter : 3,    verses    : [16,18,20],
              ui_ref  : 'John 3:16,18,20',
              url_ref : 'JHN.003.016,018,020',
    },
  },
  { val   : 'John 3:20,18,16',
    expect: { is_valid: true, book_abbr : 'JHN',
              chapter : 3,    verses    : [16,18,20],
              ui_ref  : 'John 3:16,18,20',
              url_ref : 'JHN.003.016,018,020',
    },
  },
  { val   : 'John 3:20,16,18',
    expect: { is_valid: true, book_abbr : 'JHN',
              chapter : 3,    verses    : [16,18,20],
              ui_ref  : 'John 3:16,18,20',
              url_ref : 'JHN.003.016,018,020',
    },
  },
  { val   : 'John 3:16-18,20',
    expect: { is_valid: true, book_abbr : 'JHN',
              chapter : 3,    verses    : [16,17,18,20],
              ui_ref  : 'John 3:16-18,20',
              url_ref : 'JHN.003.016-018,020',
    },
  },
  { val   : 'John 3:16-18,20,22',
    expect: { is_valid: true, book_abbr : 'JHN',
              chapter : 3,    verses    : [16,17,18,20,22],
              ui_ref  : 'John 3:16-18,20,22',
              url_ref : 'JHN.003.016-018,020,022',
    },
  },
  { val   : 'John 3:16-18,22,20',
    expect: { is_valid: true, book_abbr : 'JHN',
              chapter : 3,    verses    : [16,17,18,20,22],
              ui_ref  : 'John 3:16-18,20,22',
              url_ref : 'JHN.003.016-018,020,022',
    },
  },
  { msg   : 'should parse John 3:37 to John 3:36',
    val   : 'John 3:37',
    expect: { is_valid: true, book_abbr: 'JHN', chapter: 3, verses : [36],
              ui_ref  : 'John 3:36',
              url_ref : 'JHN.003.036',
    },
  },
  { msg   : 'should parse John 3:37 as invalid without bounds',
    val   : 'John 3:37',
    bounds: false,
    expect: { is_valid: false,  book_abbr: null,  chapter: null, verses: [],
              ui_ref  : null,
              url_ref : null,
    },
  },

  /*************************************************************************/
  { val   : 'JHN.003.016',
    expect: { is_valid: true, book_abbr: 'JHN', chapter: 3, verses : [16],
              ui_ref  : 'John 3:16',
              url_ref : 'JHN.003.016',
    },
  },
  { val   : 'JHN.003.016-017',
    expect: { is_valid: true, book_abbr: 'JHN', chapter: 3, verses : [16,17],
              ui_ref  : 'John 3:16-17',
              url_ref : 'JHN.003.016-017',
    },
  },
  { val   : 'JHN.003.016,017',
    expect: { is_valid: true, book_abbr: 'JHN', chapter: 3, verses : [16,17],
              ui_ref  : 'John 3:16-17',
              url_ref : 'JHN.003.016-017',
    },
  },
  { val   : 'JHN.003.016-020',
    expect: { is_valid: true, book_abbr : 'JHN',
              chapter : 3,    verses    : [16,17,18,19,20],
              ui_ref  : 'John 3:16-20',
              url_ref : 'JHN.003.016-020',
    },
  },
  { val   : 'JHN.003.016,020',
    expect: { is_valid: true, book_abbr: 'JHN', chapter: 3, verses : [16,20],
              ui_ref  : 'John 3:16,20',
              url_ref : 'JHN.003.016,020',
    },
  },
  { val   : 'JHN.003.016,018,020',
    expect: { is_valid: true, book_abbr : 'JHN',
              chapter : 3,    verses    : [16,18,20],
              ui_ref  : 'John 3:16,18,20',
              url_ref : 'JHN.003.016,018,020',
    },
  },
  { val   : 'JHN.003.016-018,020',
    expect: { is_valid: true, book_abbr : 'JHN',
              chapter : 3,    verses    : [16,17,18,20],
              ui_ref  : 'John 3:16-18,20',
              url_ref : 'JHN.003.016-018,020',
    },
  },
  { val   : 'JHN.003.016-018,020,022',
    expect: { is_valid: true, book_abbr : 'JHN',
              chapter : 3,    verses    : [16,17,18,20,22],
              ui_ref  : 'John 3:16-18,20,22',
              url_ref : 'JHN.003.016-018,020,022',
    },
  },
  { val   : 'JUD.001',
    expect: { is_valid: true, book_abbr: 'JUD', chapter: 1, verses : [],
              ui_ref  : 'Jude 1',
              url_ref : 'JUD.001',
    },
  },
  /*************************************************************************
   * Single Chapters {
   */
  { msg   : 'should parse Obadiah 20 to Obadiah 1:20',
    val   : 'Obadiah 20',
    expect: { is_valid: true, book_abbr: 'OBA', chapter: 1, verses : [20],
              ui_ref  : 'Obadiah 1:20',
              url_ref : 'OBA.001.020',
    },
  },
  { msg   : 'should parse Philemon 20 to Philemon 1:20',
    val   : 'Philemon 20',
    expect: { is_valid: true, book_abbr: 'PHM', chapter: 1, verses : [20],
              ui_ref  : 'Philemon 1:20',
              url_ref : 'PHM.001.020',
    },
  },
  { msg   : 'should parse 2 John 13 to 2 John 1:13',
    val   : '2 John 13',
    expect: { is_valid: true, book_abbr: '2JN', chapter: 1, verses : [13],
              ui_ref  : '2 John 1:13',
              url_ref : '2JN.001.013',
    },
  },
  { msg   : 'should parse 3 John 10 to 3 John 1:10',
    val   : '3 John 10',
    expect: { is_valid: true, book_abbr: '3JN', chapter: 1, verses : [10],
              ui_ref  : '3 John 1:10',
              url_ref : '3JN.001.010',
    },
  },
  { msg   : 'should parse JUD.019 to Jude 1:19',
    val   : 'JUD.019',
    expect: { is_valid: true, book_abbr: 'JUD', chapter: 1, verses : [19],
              ui_ref  : 'Jude 1:19',
              url_ref : 'JUD.001.019',
    },
  },
  /* Single Chapters }
   *************************************************************************
   * Invalid {
   */
  { msg   : 'should parse JUD.031 to Jude 1:25',
    val   : 'JUD.031',
    bounds: true,
    expect: { is_valid: true,  book_abbr: 'JUD', chapter: 1, verses: [25],
              ui_ref  : 'Jude 1:25',
              url_ref : 'JUD.001.025',
    },
  },
  { msg   : 'should mark JUD.031 as invalid without bounds',
    val   : 'JUD.031',
    bounds: false,
    expect: { is_valid: false,  book_abbr: null,  chapter: null, verses: [],
              ui_ref  : null,
              url_ref : null,
    },
  },
  /* Invalid }
   *************************************************************************/
];