const tests = [
  { str:'GEN', expect:'GEN' },
  { str:'Genesis', expect:'GEN' },
  { str:'EXO', expect:'EXO' },
  { str:'Exodus', expect:'EXO' },
  { str:'LEV', expect:'LEV' },
  { str:'Leviticus', expect:'LEV' },
  { str:'NUM', expect:'NUM' },
  { str:'Numbers', expect:'NUM' },
  { str:'DEU', expect:'DEU' },
  { str:'Deuteronomy', expect:'DEU' },
  { str:'JOS', expect:'JOS' },
  { str:'Joshua', expect:'JOS' },
  { str:'JDG', expect:'JDG' },
  { str:'Judges', expect:'JDG' },
  { str:'RUT', expect:'RUT' },
  { str:'Ruth', expect:'RUT' },
  { str:'1SA', expect:'1SA' },
  { str:'1 Samuel', expect:'1SA' },
  { str:'2SA', expect:'2SA' },
  { str:'2 Samuel', expect:'2SA' },
  { str:'1KI', expect:'1KI' },
  { str:'1 Kings', expect:'1KI' },
  { str:'2KI', expect:'2KI' },
  { str:'2 Kings', expect:'2KI' },
  { str:'1CH', expect:'1CH' },
  { str:'1 Chronicles', expect:'1CH' },
  { str:'2CH', expect:'2CH' },
  { str:'2 Chronicles', expect:'2CH' },
  { str:'EZR', expect:'EZR' },
  { str:'Ezra', expect:'EZR' },
  { str:'NEH', expect:'NEH' },
  { str:'Nehemiah', expect:'NEH' },
  { str:'EST', expect:'EST' },
  { str:'Esther (Hebrew)', expect:'EST' },
  { str:'Esther', expect:'EST' },
  { str:'JOB', expect:'JOB' },
  { str:'Job', expect:'JOB' },
  { str:'PSA', expect:'PSA' },
  { str:'Psalms', expect:'PSA' },
  { str:'Psalm', expect:'PSA' },
  { str:'PRO', expect:'PRO' },
  { str:'Proverbs', expect:'PRO' },
  { str:'ECC', expect:'ECC' },
  { str:'Ecclesiastes', expect:'ECC' },
  { str:'SNG', expect:'SNG' },
  { str:'Song of Songs', expect:'SNG' },
  { str:'Song of Solomon', expect:'SNG' },
  { str:'ISA', expect:'ISA' },
  { str:'Isaiah', expect:'ISA' },
  { str:'JER', expect:'JER' },
  { str:'Jeremiah', expect:'JER' },
  { str:'LAM', expect:'LAM' },
  { str:'Lamentations', expect:'LAM' },
  { str:'EZK', expect:'EZK' },
  { str:'Ezekiel', expect:'EZK' },
  { str:'DAN', expect:'DAN' },
  { str:'Daniel (Hebrew)', expect:'DAN' },
  { str:'HOS', expect:'HOS' },
  { str:'Hosea', expect:'HOS' },
  { str:'JOL', expect:'JOL' },
  { str:'Joel', expect:'JOL' },
  { str:'AMO', expect:'AMO' },
  { str:'Amos', expect:'AMO' },
  { str:'OBA', expect:'OBA' },
  { str:'Obadiah', expect:'OBA' },
  { str:'JON', expect:'JON' },
  { str:'Jonah', expect:'JON' },
  { str:'MIC', expect:'MIC' },
  { str:'Micah', expect:'MIC' },
  { str:'NAM', expect:'NAM' },
  { str:'Nahum', expect:'NAM' },
  { str:'HAB', expect:'HAB' },
  { str:'Habakkuk', expect:'HAB' },
  { str:'ZEP', expect:'ZEP' },
  { str:'Zephaniah', expect:'ZEP' },
  { str:'HAG', expect:'HAG' },
  { str:'Haggai', expect:'HAG' },
  { str:'ZEC', expect:'ZEC' },
  { str:'Zechariah', expect:'ZEC' },
  { str:'MAL', expect:'MAL' },
  { str:'Malachi', expect:'MAL' },

  { str:'MAT', expect:'MAT' },
  { str:'Matthew', expect:'MAT' },
  { str:'MRK', expect:'MRK' },
  { str:'Mark', expect:'MRK' },
  { str:'LUK', expect:'LUK' },
  { str:'Luke', expect:'LUK' },
  { str:'JHN', expect:'JHN' },
  { str:'John', expect:'JHN' },
  { str:'ACT', expect:'ACT' },
  { str:'Acts', expect:'ACT' },
  { str:'ROM', expect:'ROM' },
  { str:'Romans', expect:'ROM' },
  { str:'1CO', expect:'1CO' },
  { str:'1 Corinthians', expect:'1CO' },
  { str:'2CO', expect:'2CO' },
  { str:'2 Corinthians', expect:'2CO' },
  { str:'GAL', expect:'GAL' },
  { str:'Galatians', expect:'GAL' },
  { str:'EPH', expect:'EPH' },
  { str:'Ephesians', expect:'EPH' },
  { str:'PHP', expect:'PHP' },
  { str:'Philippians', expect:'PHP' },
  { str:'COL', expect:'COL' },
  { str:'Colossians', expect:'COL' },
  { str:'1TH', expect:'1TH' },
  { str:'1 Thessalonians', expect:'1TH' },
  { str:'2TH', expect:'2TH' },
  { str:'2 Thessalonians', expect:'2TH' },
  { str:'1TI', expect:'1TI' },
  { str:'1 Timothy', expect:'1TI' },
  { str:'2TI', expect:'2TI' },
  { str:'2 Timothy', expect:'2TI' },
  { str:'TIT', expect:'TIT' },
  { str:'Titus', expect:'TIT' },
  { str:'PHM', expect:'PHM' },
  { str:'Philemon', expect:'PHM' },
  { str:'HEB', expect:'HEB' },
  { str:'Hebrews', expect:'HEB' },
  { str:'JAS', expect:'JAS' },
  { str:'James', expect:'JAS' },
  { str:'1PE', expect:'1PE' },
  { str:'1 Peter', expect:'1PE' },
  { str:'2PE', expect:'2PE' },
  { str:'2 Peter', expect:'2PE' },
  { str:'1JN', expect:'1JN' },
  { str:'1 John', expect:'1JN' },
  { str:'2JN', expect:'2JN' },
  { str:'2 John', expect:'2JN' },
  { str:'3JN', expect:'3JN' },
  { str:'3 John', expect:'3JN' },
  { str:'JUD', expect:'JUD' },
  { str:'Jude', expect:'JUD' },
  { str:'REV', expect:'REV' },
  { str:'Revelation', expect:'REV' },

  { str:'TOB', expect:'TOB' },
  { str:'Tobit', expect:'TOB' },
  { str:'JDT', expect:'JDT' },
  { str:'Judith', expect:'JDT' },
  { str:'WIS', expect:'WIS' },
  { str:'Wisdom of Solomon', expect:'WIS' },
  { str:'SIR', expect:'SIR' },
  { str:'Sirach (Ecclesiasticus)', expect:'SIR' },
  { str:'BAR', expect:'BAR' },
  { str:'Baruch', expect:'BAR' },
  { str:'ESG', expect:'ESG' },
  { str:'Esther Greek', expect:'ESG' },
  { str:'LJE', expect:'LJE' },
  { str:'Letter of Jeremiah', expect:'LJE' },
  { str:'S3Y', expect:'S3Y' },
  { str:'Song of 3 Young Men', expect:'S3Y' },
  { str:'SUS', expect:'SUS' },
  { str:'Susanna', expect:'SUS' },
  { str:'BEL', expect:'BEL' },
  { str:'Bel and the Dragon', expect:'BEL' },
  { str:'1MA', expect:'1MA' },
  { str:'1 Maccabees', expect:'1MA' },
  { str:'2MA', expect:'2MA' },
  { str:'2 Maccabees', expect:'2MA' },
  { str:'3MA', expect:'3MA' },
  { str:'3 Maccabees', expect:'3MA' },
  { str:'4MA', expect:'4MA' },
  { str:'4 Maccabees', expect:'4MA' },
  { str:'1ES', expect:'1ES' },
  { str:'1 Esdras (Greek)', expect:'1ES' },
  { str:'2ES', expect:'2ES' },
  { str:'2 Esdras (Latin)', expect:'2ES' },
  { str:'MAN', expect:'MAN' },
  { str:'Prayer of Manasseh', expect:'MAN' },
  { str:'PS2', expect:'PS2' },
  { str:'Psalm 151', expect:'PS2' },
  { str:'ODA', expect:'ODA' },
  { str:'Odes', expect:'ODA' },
  { str:'PSS', expect:'PSS' },
  { str:'Psalms of Solomon', expect:'PSS' },
  { str:'EZA', expect:'EZA' },
  { str:'Apocalypse of Ezra', expect:'EZA' },
  { str:'5EZ', expect:'5EZ' },
  { str:'5 Ezra', expect:'5EZ' },
  { str:'6EZ', expect:'6EZ' },
  { str:'6 Ezra', expect:'6EZ' },
  { str:'DAG', expect:'DAG' },
  { str:'Daniel Greek', expect:'DAG' },
  { str:'PS3', expect:'PS3' },
  { str:'Psalms 152-155', expect:'PS3' },
  { str:'2BA', expect:'2BA' },
  { str:'2 Baruch (Apocalypse)', expect:'2BA' },
  { str:'LBA', expect:'LBA' },
  { str:'Letter of Baruch', expect:'LBA' },
  { str:'JUB', expect:'JUB' },
  { str:'Jubilees', expect:'JUB' },
  { str:'ENO', expect:'ENO' },
  { str:'Enoch 1MQ - 1 Meqabyan', expect:'ENO' },
  { str:'2MQ', expect:'2MQ' },
  { str:'2 Meqabyan', expect:'2MQ' },
  { str:'3MQ', expect:'3MQ' },
  { str:'3 Meqabyan', expect:'3MQ' },
  { str:'REP', expect:'REP' },
  { str:'Reproof 4BA - 4 Baruch', expect:'REP' },
  { str:'LAO', expect:'LAO' },
  { str:'Laodiceans', expect:'LAO' },

  { str:'XXA', expect:'XXA' },
  { str:'Extra A, e.g. a hymnal', expect:'XXA' },
  { str:'XXB', expect:'XXB' },
  { str:'Extra B', expect:'XXB' },
  { str:'XXC', expect:'XXC' },
  { str:'Extra C', expect:'XXC' },
  { str:'XXD', expect:'XXD' },
  { str:'Extra D', expect:'XXD' },
  { str:'XXE', expect:'XXE' },
  { str:'Extra E', expect:'XXE' },
  { str:'XXF', expect:'XXF' },
  { str:'Extra F', expect:'XXF' },
  { str:'XXG', expect:'XXG' },
  { str:'Extra G', expect:'XXG' },
  { str:'FRT', expect:'FRT' },
  { str:'Front Matter', expect:'FRT' },
  { str:'BAK', expect:'BAK' },
  { str:'Back Matter', expect:'BAK' },
  { str:'OTH', expect:'OTH' },
  { str:'Other Matter', expect:'OTH' },
  { str:'INT', expect:'INT' },
  { str:'Introduction', expect:'INT' },
  { str:'CNC', expect:'CNC' },
  { str:'Concordance', expect:'CNC' },
  { str:'GLO', expect:'GLO' },
  { str:'Glossary', expect:'GLO' },
  { str:'TDX', expect:'TDX' },
  { str:'Topical Index', expect:'TDX' },
  { str:'NDX', expect:'NDX' },
  { str:'Names Index', expect:'NDX' },
];

module.exports = tests;