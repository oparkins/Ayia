const tests = [
  { ref   : 'GEN',
    error : 'Error missing chapter (from)',
  },
  { ref   : 'GEN.1',
    expect: {
      book: 'GEN',
      from: { chapter: 1, verse: 1 },
      to: { chapter: 1, verse: 31 }
    }
  },
  { ref   : 'GEN.1.2',
    expect: {
      book: 'GEN',
      from: { chapter: 1, verse: 2 },
      to: { chapter: 1, verse: 2 }
    }
  },
  { ref   : 'GEN.1.2-3',
    expect: {
      book: 'GEN',
      from: { chapter: 1, verse: 2 },
      to: { chapter: 1, verse: 3 }
    }
  },
  { ref   : 'GEN.1.2-3.4',
    expect: {
      book: 'GEN',
      from: { chapter: 1, verse: 2 },
      to: { chapter: 3, verse: 4 }
    }
  },
  { ref   : 'GEN.1.3-2',
    expect: {
      book: 'GEN',
      from: { chapter: 1, verse: 2 },
      to: { chapter: 1, verse: 3 }
    }
  },
  { ref   : 'GEN.3.4-1.2',
    expect: {
      book: 'GEN',
      from: { chapter: 1, verse: 2 },
      to: { chapter: 3, verse: 4 }
    }
  },
  { ref   : 'GEN.3.1-2.4',
    expect: {
      book: 'GEN',
      from: { chapter: 2, verse: 4 },
      to: { chapter: 3, verse: 1 }
    }
  },
];

module.exports = tests;
