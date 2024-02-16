/* Source: Unified Scripture XML 3.0
 *  https://ubsicap.github.io/usx/vocabularies.html
 *
 * Order:
 *  https://www.usccb.org/offices/new-american-bible/books-bible
 */
const BookMap = {
  // Old Testament (OT) {          canonical order (null == not in cannon)
  'GEN': { name: 'Genesis',                 ord: 1,     loc: 'Old Testament' },
  'EXO': { name: 'Exodus',                  ord: 2,     loc: 'Old Testament' },
  'LEV': { name: 'Leviticus',               ord: 3,     loc: 'Old Testament' },
  'NUM': { name: 'Numbers',                 ord: 4,     loc: 'Old Testament' },
  'DEU': { name: 'Deuteronomy',             ord: 5,     loc: 'Old Testament' },
  'JOS': { name: 'Joshua',                  ord: 6,     loc: 'Old Testament' },
  'JDG': { name: 'Judges',                  ord: 7,     loc: 'Old Testament' },
  'RUT': { name: 'Ruth',                    ord: 8,     loc: 'Old Testament' },
  '1SA': { name: '1 Samuel',                ord: 9,     loc: 'Old Testament' },
  '2SA': { name: '2 Samuel',                ord: 10,    loc: 'Old Testament' },
  '1KI': { name: '1 Kings',                 ord: 11,    loc: 'Old Testament' },
  '2KI': { name: '2 Kings',                 ord: 12,    loc: 'Old Testament' },
  '1CH': { name: '1 Chronicles',            ord: 13,    loc: 'Old Testament' },
  '2CH': { name: '2 Chronicles',            ord: 14,    loc: 'Old Testament' },
  'EZR': { name: 'Ezra',                    ord: 15,    loc: 'Old Testament' },
  'NEH': { name: 'Nehemiah',                ord: 16,    loc: 'Old Testament' },
  'EST': { name: 'Esther (Hebrew)',         ord: 17,    loc: 'Old Testament' },
  'JOB': { name: 'Job',                     ord: 18,    loc: 'Old Testament' },
  'PSA': { name: 'Psalms',                  ord: 19,    loc: 'Old Testament' },
  'PRO': { name: 'Proverbs',                ord: 20,    loc: 'Old Testament' },
  'ECC': { name: 'Ecclesiastes',            ord: 21,    loc: 'Old Testament' },
  'SNG': { name: 'Song of Songs',           ord: 22,    loc: 'Old Testament' },
  'ISA': { name: 'Isaiah',                  ord: 23,    loc: 'Old Testament' },
  'JER': { name: 'Jeremiah',                ord: 24,    loc: 'Old Testament' },
  'LAM': { name: 'Lamentations',            ord: 25,    loc: 'Old Testament' },
  'EZK': { name: 'Ezekiel',                 ord: 26,    loc: 'Old Testament' },
  'DAN': { name: 'Daniel (Hebrew)',         ord: 27,    loc: 'Old Testament' },
  'HOS': { name: 'Hosea',                   ord: 28,    loc: 'Old Testament' },
  'JOL': { name: 'Joel',                    ord: 29,    loc: 'Old Testament' },
  'AMO': { name: 'Amos',                    ord: 30,    loc: 'Old Testament' },
  'OBA': { name: 'Obadiah',                 ord: 31,    loc: 'Old Testament' },
  'JON': { name: 'Jonah',                   ord: 32,    loc: 'Old Testament' },
  'MIC': { name: 'Micah',                   ord: 33,    loc: 'Old Testament' },
  'NAM': { name: 'Nahum',                   ord: 34,    loc: 'Old Testament' },
  'HAB': { name: 'Habakkuk',                ord: 35,    loc: 'Old Testament' },
  'ZEP': { name: 'Zephaniah',               ord: 36,    loc: 'Old Testament' },
  'HAG': { name: 'Haggai',                  ord: 37,    loc: 'Old Testament' },
  'ZEC': { name: 'Zechariah',               ord: 38,    loc: 'Old Testament' },
  'MAL': { name: 'Malachi',                 ord: 39,    loc: 'Old Testament' },
  // Old Testament (OT) }
  // New Testament (NT) {
  'MAT': { name: 'Matthew',                 ord: 40,    loc: 'New Testament' },
  'MRK': { name: 'Mark',                    ord: 41,    loc: 'New Testament' },
  'LUK': { name: 'Luke',                    ord: 42,    loc: 'New Testament' },
  'JHN': { name: 'John',                    ord: 43,    loc: 'New Testament' },
  'ACT': { name: 'Acts',                    ord: 44,    loc: 'New Testament' },
  'ROM': { name: 'Romans',                  ord: 45,    loc: 'New Testament' },
  '1CO': { name: '1 Corinthians',           ord: 46,    loc: 'New Testament' },
  '2CO': { name: '2 Corinthians',           ord: 47,    loc: 'New Testament' },
  'GAL': { name: 'Galatians',               ord: 48,    loc: 'New Testament' },
  'EPH': { name: 'Ephesians',               ord: 49,    loc: 'New Testament' },
  'PHP': { name: 'Philippians',             ord: 50,    loc: 'New Testament' },
  'COL': { name: 'Colossians',              ord: 51,    loc: 'New Testament' },
  '1TH': { name: '1 Thessalonians',         ord: 52,    loc: 'New Testament' },
  '2TH': { name: '2 Thessalonians',         ord: 53,    loc: 'New Testament' },
  '1TI': { name: '1 Timothy',               ord: 54,    loc: 'New Testament' },
  '2TI': { name: '2 Timothy',               ord: 55,    loc: 'New Testament' },
  'TIT': { name: 'Titus',                   ord: 56,    loc: 'New Testament' },
  'PHM': { name: 'Philemon',                ord: 57,    loc: 'New Testament' },
  'HEB': { name: 'Hebrews',                 ord: 58,    loc: 'New Testament' },
  'JAS': { name: 'James',                   ord: 59,    loc: 'New Testament' },
  '1PE': { name: '1 Peter',                 ord: 60,    loc: 'New Testament' },
  '2PE': { name: '2 Peter',                 ord: 61,    loc: 'New Testament' },
  '1JN': { name: '1 John',                  ord: 62,    loc: 'New Testament' },
  '2JN': { name: '2 John',                  ord: 63,    loc: 'New Testament' },
  '3JN': { name: '3 John',                  ord: 64,    loc: 'New Testament' },
  'JUD': { name: 'Jude',                    ord: 65,    loc: 'New Testament' },
  'REV': { name: 'Revelation',              ord: 66,    loc: 'New Testament' },
  // New Testament (NT) }
  // Deuterocanon (DC) {
  //    Between: Nehemiah (16) and Ester (17)
  'TOB': { name: 'Tobit',                   ord: 16.1,  loc: 'Deuterocanon' },
  'JDT': { name: 'Judith',                  ord: 16.2,  loc: 'Deuterocanon' },
  //    Between: Esther (17) and Job (18)
  'ESG': { name: 'Esther Greek',            ord: 17.1,  loc: 'Deuterocanon' },
  //    Between: Song of Songs (22) and Isaiah (23)
  'WIS': { name: 'Wisdom of Solomon',       ord: 22.1,  loc: 'Deuterocanon' },
  'SIR': { name: 'Sirach (Ecclesiasticus)', ord: 22.2,  loc: 'Deuterocanon' },
  //    Between: Lamentations (25) and Ezekiel (26)
  'BAR': { name: 'Baruch',                  ord: 25.1,  loc: 'Deuterocanon' },

  // NOT in the cannon
  'LJE': { name: 'Letter of Jeremiah',                  loc: 'Deuterocanon' },
  'S3Y': { name: 'Song of 3 Young Men',                 loc: 'Deuterocanon' },
  'SUS': { name: 'Susanna',                             loc: 'Deuterocanon' },
  'BEL': { name: 'Bel and the Dragon',                  loc: 'Deuterocanon' },
  '1MA': { name: '1 Maccabees',                         loc: 'Deuterocanon' },
  '2MA': { name: '2 Maccabees',                         loc: 'Deuterocanon' },
  '3MA': { name: '3 Maccabees',                         loc: 'Deuterocanon' },
  '4MA': { name: '4 Maccabees',                         loc: 'Deuterocanon' },
  '1ES': { name: '1 Esdras (Greek)',                    loc: 'Deuterocanon' },
  '2ES': { name: '2 Esdras (Latin)',                    loc: 'Deuterocanon' },
  'MAN': { name: 'Prayer of Manasseh',                  loc: 'Deuterocanon' },
  'PS2': { name: 'Psalm 151',                           loc: 'Deuterocanon' },
  'ODA': { name: 'Odes',                                loc: 'Deuterocanon' },
  'PSS': { name: 'Psalms of Solomon',                   loc: 'Deuterocanon' },
  'EZA': { name: 'Apocalypse of Ezra',                  loc: 'Deuterocanon' },
  '5EZ': { name: '5 Ezra',                              loc: 'Deuterocanon' },
  '6EZ': { name: '6 Ezra',                              loc: 'Deuterocanon' },
  'DAG': { name: 'Daniel Greek',                        loc: 'Deuterocanon' },
  'PS3': { name: 'Psalms 152-155',                      loc: 'Deuterocanon' },
  '2BA': { name: '2 Baruch (Apocalypse)',               loc: 'Deuterocanon' },
  'LBA': { name: 'Letter of Baruch',                    loc: 'Deuterocanon' },
  'JUB': { name: 'Jubilees',                            loc: 'Deuterocanon' },
  'ENO': { name: 'Enoch 1MQ - 1 Meqabyan',              loc: 'Deuterocanon' },
  '2MQ': { name: '2 Meqabyan',                          loc: 'Deuterocanon' },
  '3MQ': { name: '3 Meqabyan',                          loc: 'Deuterocanon' },
  'REP': { name: 'Reproof 4BA - 4 Baruch',              loc: 'Deuterocanon' },
  'LAO': { name: 'Laodiceans',                          loc: 'Deuterocanon' },
  // Deuterocanon (DC) }
  // Non scripture (NS) {
  'XXA': { name: 'Extra A, e.g. a hymnal',              loc: 'Non scripture' },
  'XXB': { name: 'Extra B',                             loc: 'Non scripture' },
  'XXC': { name: 'Extra C',                             loc: 'Non scripture' },
  'XXD': { name: 'Extra D',                             loc: 'Non scripture' },
  'XXE': { name: 'Extra E',                             loc: 'Non scripture' },
  'XXF': { name: 'Extra F',                             loc: 'Non scripture' },
  'XXG': { name: 'Extra G',                             loc: 'Non scripture' },
  'FRT': { name: 'Front Matter',                        loc: 'Non scripture' },
  'BAK': { name: 'Back Matter',                         loc: 'Non scripture' },
  'OTH': { name: 'Other Matter',                        loc: 'Non scripture' },
  'INT': { name: 'Introduction',                        loc: 'Non scripture' },
  'CNC': { name: 'Concordance',                         loc: 'Non scripture' },
  'GLO': { name: 'Glossary',                            loc: 'Non scripture' },
  'TDX': { name: 'Topical Index',                       loc: 'Non scripture' },
  'NDX': { name: 'Names Index',                         loc: 'Non scripture' },
  // Non scripture (NS) }
};

/**
 *  Fetch the full name and location of the given book abbreviation.
 *  @method getBook
 *  @param  abbr  The book abbreviation {String};
 *
 *  @return Book information {Object | undefined};
 *            { abbr: The abbreviated book name {String},
 *              name: The full name of the book {String},
 *              loc : The location of the book {String},
 *            }
 */
function getBook( abbr ) {
  if (typeof(abbr) !== 'string')  { return }

  const ABBR  = abbr.toUpperCase();
  // :XXX: On success, return the matching pair [key, entry]
  const found = Object.entries( BookMap ).find( ([key, entry]) => {
    return (key === ABBR);
  });

  //console.log('abbr[ %s / %s ], entry:', abbr, ABBR, found);

  if (found == null)  { return }

  const entry = found[1];
  return {
    abbr: ABBR,
    name: entry.name,
    loc : entry.loc,
  };
}

/**
 *  Fetch the ordered list of books for the given location.
 *  @method getBooks
 *  @param  loc   The desired location(s) {String};
 *
 *  `loc` may be a request for multiple "locations" either via '*'' (all books)
 *  or by separating locations with one of the characters [,;|+], for example:
 *    ot,nt   == Both Old and New Testaments
 *
 *  @return The ordered list of books {Array} where each entry has the form:
 *            { abbr: The abbreviated book name {String},
 *              name: The full name of the book {String},
 *              loc : The location of the book {String},
 *            }
 */
function getBooks( loc ) {
  const locMap  = {
    'Old Testament' : /ot|old.*test(ament)?/i,
    'New Testament' : /nt|new.*test(ament)?/i,
    'Deuterocanon'  : /dc|deutero.*canon/i,
    'Non scripture' : /ns|non.*script(ure)?/i,
  };
  let   locs    = null;

  if (loc === '*') {
    locs = Object.keys( locMap );

  } else {
    /* Split `loc` and for each portion, walk through `locMap` and for any
     * RegExp that matches the portion, add the key (e.g. 'Old Testament') to
     * `locSet'.
     */
    const locSet  = new Set();

    loc.split(/\s*[,;|+]\s*/)
      .map( str => {
        for (let key in locMap) {
          const re = locMap[key];
          if (re.test( str )) {
            locSet.add( key );
            break
          }
        }
      });

    if (locSet.size < 1) {
      return [];
    }

    locs = Array.from( locSet );
  }

  // Gather the entries for the target location
  const entries = Object.entries( BookMap ).reduce( (acc, [key, entry]) => {
    if (locs.includes( entry.loc )) {
      acc.push( { abbr: key, ...entry } );
    }
    return acc;
  }, []);

  return entries;
}

module.exports  = {
  getBook,
  getBooks,
};
// vi: ft=javascript
