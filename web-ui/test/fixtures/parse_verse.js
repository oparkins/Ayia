export const tests  = [
  { val   : 'John 3:16',
    expect: { book: 'John ', chapter: 3, verse: 16, verses : [16],
              ui_ref  : 'John 3:16',
              url_ref : 'JHN.003.016',
    },
  },
  { val   : '1 John 3:16',
    expect: { book: '1 John ', chapter: 3, verse: 16, verses : [16],
              ui_ref  : '1 John 3:16',
              url_ref : '1JN.003.016',
    },
  },
  { val   : 'Song of Songs 1:2',
    expect: { book: 'Song of Songs ', chapter: 1, verse: 2, verses : [2],
              ui_ref  : 'Song of Songs 1:2',
              url_ref : 'SNG.001.002',
    },
  },
  { val   : 'Esther 3:4',
    expect: { book: 'Esther ', chapter: 3, verse: 4, verses : [4],
              ui_ref  : 'Esther 3:4',
              url_ref : 'EST.003.004',
    },
  },

  /*************************************************************************/
  { val   : 'John 3:16-17',
    expect: { book: 'John ', chapter: 3, verse: 16, verses : [16,17],
              ui_ref  : 'John 3:16-17',
              url_ref : 'JHN.003.016-017',
    },
  },
  { val   : 'John 3:16,17',
    expect: { book: 'John ', chapter: 3, verse: 16, verses : [16,17],
              ui_ref  : 'John 3:16,17',
              url_ref : 'JHN.003.016,017',
    },
  },
  { val   : 'John 3:16-20',
    expect: { book: 'John ', chapter: 3, verse: 16, verses : [16,17,18,19,20],
              ui_ref  : 'John 3:16-20',
              url_ref : 'JHN.003.016-020',
    },
  },
  { val   : 'John 3:16,20',
    expect: { book: 'John ', chapter: 3, verse: 16, verses : [16,20],
              ui_ref  : 'John 3:16,20',
              url_ref : 'JHN.003.016,020',
    },
  },
  { val   : 'John 3:16,18,20',
    expect: { book: 'John ', chapter: 3, verse: 16, verses : [16,18,20],
              ui_ref  : 'John 3:16,18,20',
              url_ref : 'JHN.003.016,018,020',
    },
  },
  { val   : 'John 3:16-18,20',
    expect: { book: 'John ', chapter: 3, verse: 16, verses : [16,17,18,20],
              ui_ref  : 'John 3:16-18,20',
              url_ref : 'JHN.003.016-018,020',
    },
  },
  { val   : 'John 3:16-18,20,22',
    expect: { book: 'John ', chapter: 3, verse: 16, verses : [16,17,18,20,22],
              ui_ref  : 'John 3:16-18,20,22',
              url_ref : 'JHN.003.016-018,020,022',
    },
  },
  { msg   : 'should parse John 3:37 to John 3:36',
    val   : 'John 3:37',
    expect: { book: 'John ', chapter: 3, verse: 36, verses : [36],
              ui_ref  : 'John 3:36',
              url_ref : 'JHN.003.036',
    },
  },

  /*************************************************************************/
  { val   : 'JHN.003.016',
    expect: { book: 'JHN', chapter: 3, verse: 16, verses : [16],
              ui_ref  : 'John 3:16',
              url_ref : 'JHN.003.016',
    },
  },
  { val   : 'JHN.003.016-017',
    expect: { book: 'JHN', chapter: 3, verse: 16, verses : [16,17],
              ui_ref  : 'John 3:16-17',
              url_ref : 'JHN.003.016-017',
    },
  },
  { val   : 'JHN.003.016,017',
    expect: { book: 'JHN', chapter: 3, verse: 16, verses : [16,17],
              ui_ref  : 'John 3:16,17',
              url_ref : 'JHN.003.016,017',
    },
  },
  { val   : 'JHN.003.016-020',
    expect: { book: 'JHN', chapter: 3, verse: 16, verses : [16,17,18,19,20],
              ui_ref  : 'John 3:16-20',
              url_ref : 'JHN.003.016-020',
    },
  },
  { val   : 'JHN.003.016,020',
    expect: { book: 'JHN', chapter: 3, verse: 16, verses : [16,20],
              ui_ref  : 'John 3:16,20',
              url_ref : 'JHN.003.016,020',
    },
  },
  { val   : 'JHN.003.016,018,020',
    expect: { book: 'JHN', chapter: 3, verse: 16, verses : [16,18,20],
              ui_ref  : 'John 3:16,18,20',
              url_ref : 'JHN.003.016,018,020',
    },
  },
  { val   : 'JHN.003.016-018,020',
    expect: { book: 'JHN', chapter: 3, verse: 16, verses : [16,17,18,20],
              ui_ref  : 'John 3:16-18,20',
              url_ref : 'JHN.003.016-018,020',
    },
  },
  { val   : 'JHN.003.016-018,020,022',
    expect: { book: 'JHN', chapter: 3, verse: 16, verses : [16,17,18,20,22],
              ui_ref  : 'John 3:16-18,20,22',
              url_ref : 'JHN.003.016-018,020,022',
    },
  },
];
