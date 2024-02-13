/* Source: Unified Scripture XML 3.0
 *  https://ubsicap.github.io/usx/vocabularies.html
 */
const BookMap = {
  // Old Testament (OT) {
  'GEN': { name: 'Genesis',                   loc: 'Old Testament' },
  'EXO': { name: 'Exodus',                    loc: 'Old Testament' },
  'LEV': { name: 'Leviticus',                 loc: 'Old Testament' },
  'NUM': { name: 'Numbers',                   loc: 'Old Testament' },
  'DEU': { name: 'Deuteronomy',               loc: 'Old Testament' },
  'JOS': { name: 'Joshua',                    loc: 'Old Testament' },
  'JDG': { name: 'Judges',                    loc: 'Old Testament' },
  'RUT': { name: 'Ruth',                      loc: 'Old Testament' },
  '1SA': { name: '1 Samuel',                  loc: 'Old Testament' },
  '2SA': { name: '2 Samuel',                  loc: 'Old Testament' },
  '1KI': { name: '1 Kings',                   loc: 'Old Testament' },
  '2KI': { name: '2 Kings',                   loc: 'Old Testament' },
  '1CH': { name: '1 Chronicles',              loc: 'Old Testament' },
  '2CH': { name: '2 Chronicles',              loc: 'Old Testament' },
  'EZR': { name: 'Ezra',                      loc: 'Old Testament' },
  'NEH': { name: 'Nehemiah',                  loc: 'Old Testament' },
  'EST': { name: 'Esther (Hebrew)',           loc: 'Old Testament' },
  'JOB': { name: 'Job',                       loc: 'Old Testament' },
  'PSA': { name: 'Psalms',                    loc: 'Old Testament' },
  'PRO': { name: 'Proverbs',                  loc: 'Old Testament' },
  'ECC': { name: 'Ecclesiastes',              loc: 'Old Testament' },
  'SNG': { name: 'Song of Songs',             loc: 'Old Testament' },
  'ISA': { name: 'Isaiah',                    loc: 'Old Testament' },
  'JER': { name: 'Jeremiah',                  loc: 'Old Testament' },
  'LAM': { name: 'Lamentations',              loc: 'Old Testament' },
  'EZK': { name: 'Ezekiel',                   loc: 'Old Testament' },
  'DAN': { name: 'Daniel (Hebrew)',           loc: 'Old Testament' },
  'HOS': { name: 'Hosea',                     loc: 'Old Testament' },
  'JOL': { name: 'Joel',                      loc: 'Old Testament' },
  'AMO': { name: 'Amos',                      loc: 'Old Testament' },
  'OBA': { name: 'Obadiah',                   loc: 'Old Testament' },
  'JON': { name: 'Jonah',                     loc: 'Old Testament' },
  'MIC': { name: 'Micah',                     loc: 'Old Testament' },
  'NAM': { name: 'Nahum',                     loc: 'Old Testament' },
  'HAB': { name: 'Habakkuk',                  loc: 'Old Testament' },
  'ZEP': { name: 'Zephaniah',                 loc: 'Old Testament' },
  'HAG': { name: 'Haggai',                    loc: 'Old Testament' },
  'ZEC': { name: 'Zechariah',                 loc: 'Old Testament' },
  'MAL': { name: 'Malachi',                   loc: 'Old Testament' },
  // Old Testament (OT) }
  // New Testament (NT) {
  'MAT': { name: 'Matthew',                   loc: 'New Testament' },
  'MRK': { name: 'Mark',                      loc: 'New Testament' },
  'LUK': { name: 'Luke',                      loc: 'New Testament' },
  'JHN': { name: 'John',                      loc: 'New Testament' },
  'ACT': { name: 'Acts',                      loc: 'New Testament' },
  'ROM': { name: 'Romans',                    loc: 'New Testament' },
  '1CO': { name: '1 Corinthians',             loc: 'New Testament' },
  '2CO': { name: '2 Corinthians',             loc: 'New Testament' },
  'GAL': { name: 'Galatians',                 loc: 'New Testament' },
  'EPH': { name: 'Ephesians',                 loc: 'New Testament' },
  'PHP': { name: 'Philippians',               loc: 'New Testament' },
  'COL': { name: 'Colossians',                loc: 'New Testament' },
  '1TH': { name: '1 Thessalonians',           loc: 'New Testament' },
  '2TH': { name: '2 Thessalonians',           loc: 'New Testament' },
  '1TI': { name: '1 Timothy',                 loc: 'New Testament' },
  '2TI': { name: '2 Timothy',                 loc: 'New Testament' },
  'TIT': { name: 'Titus',                     loc: 'New Testament' },
  'PHM': { name: 'Philemon',                  loc: 'New Testament' },
  'HEB': { name: 'Hebrews',                   loc: 'New Testament' },
  'JAS': { name: 'James',                     loc: 'New Testament' },
  '1PE': { name: '1 Peter',                   loc: 'New Testament' },
  '2PE': { name: '2 Peter',                   loc: 'New Testament' },
  '1JN': { name: '1 John',                    loc: 'New Testament' },
  '2JN': { name: '2 John',                    loc: 'New Testament' },
  '3JN': { name: '3 John',                    loc: 'New Testament' },
  'JUD': { name: 'Jude',                      loc: 'New Testament' },
  'REV': { name: 'Revelation',                loc: 'New Testament' },
  // New Testament (NT) }
  // Deuterocanon (DC) {
  'TOB': { name: 'Tobit',                   loc: 'Deuterocanon' },
  'JDT': { name: 'Judith',                  loc: 'Deuterocanon' },
  'ESG': { name: 'Esther Greek',            loc: 'Deuterocanon' },
  'WIS': { name: 'Wisdom of Solomon',       loc: 'Deuterocanon' },
  'SIR': { name: 'Sirach (Ecclesiasticus)', loc: 'Deuterocanon' },
  'BAR': { name: 'Baruch',                  loc: 'Deuterocanon' },
  'LJE': { name: 'Letter of Jeremiah',      loc: 'Deuterocanon' },
  'S3Y': { name: 'Song of 3 Young Men',     loc: 'Deuterocanon' },
  'SUS': { name: 'Susanna',                 loc: 'Deuterocanon' },
  'BEL': { name: 'Bel and the Dragon',      loc: 'Deuterocanon' },
  '1MA': { name: '1 Maccabees',             loc: 'Deuterocanon' },
  '2MA': { name: '2 Maccabees',             loc: 'Deuterocanon' },
  '3MA': { name: '3 Maccabees',             loc: 'Deuterocanon' },
  '4MA': { name: '4 Maccabees',             loc: 'Deuterocanon' },
  '1ES': { name: '1 Esdras (Greek)',        loc: 'Deuterocanon' },
  '2ES': { name: '2 Esdras (Latin)',        loc: 'Deuterocanon' },
  'MAN': { name: 'Prayer of Manasseh',      loc: 'Deuterocanon' },
  'PS2': { name: 'Psalm 151',               loc: 'Deuterocanon' },
  'ODA': { name: 'Odes',                    loc: 'Deuterocanon' },
  'PSS': { name: 'Psalms of Solomon',       loc: 'Deuterocanon' },
  'EZA': { name: 'Apocalypse of Ezra',      loc: 'Deuterocanon' },
  '5EZ': { name: '5 Ezra',                  loc: 'Deuterocanon' },
  '6EZ': { name: '6 Ezra',                  loc: 'Deuterocanon' },
  'DAG': { name: 'Daniel Greek',            loc: 'Deuterocanon' },
  'PS3': { name: 'Psalms 152-155',          loc: 'Deuterocanon' },
  '2BA': { name: '2 Baruch (Apocalypse)',   loc: 'Deuterocanon' },
  'LBA': { name: 'Letter of Baruch',        loc: 'Deuterocanon' },
  'JUB': { name: 'Jubilees',                loc: 'Deuterocanon' },
  'ENO': { name: 'Enoch 1MQ - 1 Meqabyan',  loc: 'Deuterocanon' },
  '2MQ': { name: '2 Meqabyan',              loc: 'Deuterocanon' },
  '3MQ': { name: '3 Meqabyan',              loc: 'Deuterocanon' },
  'REP': { name: 'Reproof 4BA - 4 Baruch',  loc: 'Deuterocanon' },
  'LAO': { name: 'Laodiceans',              loc: 'Deuterocanon' },
  // Deuterocanon (DC) }
  // Non scripture (NS) {
  'XXA': { name: 'Extra A, e.g. a hymnal',  loc: 'Non scripture' },
  'XXB': { name: 'Extra B',                 loc: 'Non scripture' },
  'XXC': { name: 'Extra C',                 loc: 'Non scripture' },
  'XXD': { name: 'Extra D',                 loc: 'Non scripture' },
  'XXE': { name: 'Extra E',                 loc: 'Non scripture' },
  'XXF': { name: 'Extra F',                 loc: 'Non scripture' },
  'XXG': { name: 'Extra G',                 loc: 'Non scripture' },
  'FRT': { name: 'Front Matter',            loc: 'Non scripture' },
  'BAK': { name: 'Back Matter',             loc: 'Non scripture' },
  'OTH': { name: 'Other Matter',            loc: 'Non scripture' },
  'INT': { name: 'Introduction',            loc: 'Non scripture' },
  'CNC': { name: 'Concordance',             loc: 'Non scripture' },
  'GLO': { name: 'Glossary',                loc: 'Non scripture' },
  'TDX': { name: 'Topical Index',           loc: 'Non scripture' },
  'NDX': { name: 'Names Index',             loc: 'Non scripture' },
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
 *  @param  loc   The desired location {String};
 *
 *  @return The ordered list of books {Array} where each entry has the form:
 *            { abbr: The abbreviated book name {String},
 *              name: The full name of the book {String},
 *              loc : The location of the book {String},
 *            }
 */
function getBooks( loc ) {
  switch( true ) {
    case /ot|old.*test(ament)?/i.test(loc):
      loc = 'Old Testament';
      break;

    case /nt|new.*test(ament)?/i.test(loc):
      loc = 'New Testament';
      break;

    case /dc|deutero.*canon/i.test(loc):
      loc = 'Deuterocanon';
      break;

    case /ns|non.*script(ure)?/i.test(loc):
      loc = 'Non scripture';
      break;

    default:
      // Unknown location
      return [];
  }

  // Gather the entries for the target location
  const entries = Object.entries( BookMap ).reduce( (acc, [key, entry]) => {
    if (entry.loc === loc) {
      acc.push( { abbr: key, name: entry.name, loc: entry.loc } );
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
