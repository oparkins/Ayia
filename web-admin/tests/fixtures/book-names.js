const tests = [
  { str:'GEN', expect:'GEN' },
  { str:'Genesis', expect:'GEN' },
  { str:'Ge', expect:'GEN' },
  { str:'Gen', expect:'GEN' },
  { str:'Gn', expect:'GEN' },

  { str:'EXO', expect:'EXO' },
  { str:'Exodus', expect:'EXO' },
  { str:'Ex', expect:'EXO' },

  { str:'LEV', expect:'LEV' },
  { str:'Leviticus', expect:'LEV' },
  { str:'Le', expect:'LEV' },
  { str:'Lv', expect:'LEV' },

  { str:'NUM', expect:'NUM' },
  { str:'Numbers', expect:'NUM' },
  { str:'Nu', expect:'NUM' },
  { str:'Nm', expect:'NUM' },

  { str:'DEU', expect:'DEU' },
  { str:'Deuteronomy', expect:'DEU' },
  { str:'De', expect:'DEU' },
  { str:'Deut', expect:'DEU' },
  { str:'Deuter', expect:'DEU' },
  { str:'Dt', expect:'DEU' },

  { str:'JOS', expect:'JOS' },
  { str:'Joshua', expect:'JOS' },
  { str:'Jo', expect:'JOS' },
  { str:'Josh', expect:'JOS' },
  { str:'Js', expect:'JOS' },

  { str:'JDG', expect:'JDG' },
  { str:'Judges', expect:'JDG' },
  { str:'Judg', expect:'JDG' },
  { str:'Jg', expect:'JDG' },

  { str:'RUT', expect:'RUT' },
  { str:'Ruth', expect:'RUT' },
  { str:'Ru', expect:'RUT' },
  { str:'Rt', expect:'RUT' },

  { str:'1SA', expect:'1SA' },
  { str:'1 S', expect:'1SA' },
  { str:'1 Sa', expect:'1SA' },
  { str:'1 Sam', expect:'1SA' },
  { str:'1 Samuel', expect:'1SA' },
  { str:'1 Sm', expect:'1SA' },
  { str:'1S', expect:'1SA' },
  { str:'1Sa', expect:'1SA' },
  { str:'1Sam', expect:'1SA' },
  { str:'1Samuel', expect:'1SA' },
  { str:'1Sm', expect:'1SA' },
  { str:'1st S', expect:'1SA' },
  { str:'1st Sa', expect:'1SA' },
  { str:'1st Sam', expect:'1SA' },
  { str:'1st Samuel', expect:'1SA' },
  { str:'1st Sm', expect:'1SA' },

  { str:'2SA', expect:'2SA' },
  { str:'2 S', expect:'2SA' },
  { str:'2 Sa', expect:'2SA' },
  { str:'2 Sam', expect:'2SA' },
  { str:'2 Samuel', expect:'2SA' },
  { str:'2 Sm', expect:'2SA' },
  { str:'2S', expect:'2SA' },
  { str:'2Sa', expect:'2SA' },
  { str:'2Sam', expect:'2SA' },
  { str:'2Samuel', expect:'2SA' },
  { str:'2Sm', expect:'2SA' },
  { str:'2nd S', expect:'2SA' },
  { str:'2nd Sa', expect:'2SA' },
  { str:'2nd Sam', expect:'2SA' },
  { str:'2nd Samuel', expect:'2SA' },
  { str:'2nd Sm', expect:'2SA' },

  { str:'1KI', expect:'1KI' },
  { str:'1 K', expect:'1KI' },
  { str:'1 Ki', expect:'1KI' },
  { str:'1 Kin', expect:'1KI' },
  { str:'1 King', expect:'1KI' },
  { str:'1 Kings', expect:'1KI' },
  { str:'1 Kg', expect:'1KI' },
  { str:'1 Kgs', expect:'1KI' },
  { str:'1st K', expect:'1KI' },
  { str:'1st Ki', expect:'1KI' },
  { str:'1st Kin', expect:'1KI' },
  { str:'1st King', expect:'1KI' },
  { str:'1st Kings', expect:'1KI' },
  { str:'1st Kg', expect:'1KI' },
  { str:'1st Kgs', expect:'1KI' },
  { str:'1K', expect:'1KI' },
  { str:'1Ki', expect:'1KI' },
  { str:'1Kin', expect:'1KI' },
  { str:'1King', expect:'1KI' },
  { str:'1Kings', expect:'1KI' },
  { str:'1Kg', expect:'1KI' },
  { str:'1Kgs', expect:'1KI' },

  { str:'2KI', expect:'2KI' },
  { str:'2 K', expect:'2KI' },
  { str:'2 Ki', expect:'2KI' },
  { str:'2 Kin', expect:'2KI' },
  { str:'2 King', expect:'2KI' },
  { str:'2 Kings', expect:'2KI' },
  { str:'2 Kg', expect:'2KI' },
  { str:'2 Kgs', expect:'2KI' },
  { str:'2nd K', expect:'2KI' },
  { str:'2nd Ki', expect:'2KI' },
  { str:'2nd Kin', expect:'2KI' },
  { str:'2nd King', expect:'2KI' },
  { str:'2nd Kings', expect:'2KI' },
  { str:'2nd Kg', expect:'2KI' },
  { str:'2nd Kgs', expect:'2KI' },
  { str:'2K', expect:'2KI' },
  { str:'2Ki', expect:'2KI' },
  { str:'2Kin', expect:'2KI' },
  { str:'2King', expect:'2KI' },
  { str:'2Kings', expect:'2KI' },
  { str:'2Kg', expect:'2KI' },
  { str:'2Kgs', expect:'2KI' },

  { str:'1CH', expect:'1CH' },
  { str:'1 Ch', expect:'1CH' },
  { str:'1 Chr', expect:'1CH' },
  { str:'1 Chron', expect:'1CH' },
  { str:'1 Chronicles', expect:'1CH' },
  { str:'1st Ch', expect:'1CH' },
  { str:'1st Chr', expect:'1CH' },
  { str:'1st Chron', expect:'1CH' },
  { str:'1st Chronicles', expect:'1CH' },
  { str:'1Ch', expect:'1CH' },
  { str:'1Chr', expect:'1CH' },
  { str:'1Chron', expect:'1CH' },
  { str:'1Chronicles', expect:'1CH' },

  { str:'2CH', expect:'2CH' },
  { str:'2 Ch', expect:'2CH' },
  { str:'2 Chr', expect:'2CH' },
  { str:'2 Chron', expect:'2CH' },
  { str:'2 Chronicles', expect:'2CH' },
  { str:'2nd Ch', expect:'2CH' },
  { str:'2nd Chr', expect:'2CH' },
  { str:'2nd Chron', expect:'2CH' },
  { str:'2nd Chronicles', expect:'2CH' },
  { str:'2Ch', expect:'2CH' },
  { str:'2Chr', expect:'2CH' },
  { str:'2Chron', expect:'2CH' },
  { str:'2Chronicles', expect:'2CH' },

  { str:'EZR', expect:'EZR' },
  { str:'Ezra', expect:'EZR' },
  { str:'Er', expect:'EZR' },

  { str:'NEH', expect:'NEH' },
  { str:'Ne', expect:'NEH' },
  { str:'Nehemiah', expect:'NEH' },
  { str:'Nh', expect:'NEH' },

  { str:'EST', expect:'EST' },
  { str:'Esh', expect:'EST' },
  { str:'Esther', expect:'EST' },
  { str:'Esther (Hebrew)', expect:'EST' },

  { str:'JOB', expect:'JOB' },
  { str:'Job', expect:'JOB' },
  { str:'Jb', expect:'JOB' },

  { str:'PSA', expect:'PSA' },
  { str:'Ps', expect:'PSA' },
  { str:'Psalm', expect:'PSA' },
  { str:'Psalms', expect:'PSA' },

  { str:'PRO', expect:'PRO' },
  { str:'Pr', expect:'PRO' },
  { str:'Prov', expect:'PRO' },
  { str:'Proverbs', expect:'PRO' },

  { str:'ECC', expect:'ECC' },
  { str:'Ec', expect:'ECC' },
  { str:'Ecclesiastes', expect:'ECC' },

  { str:'SNG', expect:'SNG' },
  { str:'Song', expect:'SNG' },
  { str:'Song of Songs', expect:'SNG' },
  { str:'Song of Solomon', expect:'SNG' },
  { str:'Sngs', expect:'SNG' },
  { str:'Sg', expect:'SNG' },
  { str:'Sgs', expect:'SNG' },

  { str:'ISA', expect:'ISA' },
  { str:'Is', expect:'ISA' },
  { str:'Isaiah', expect:'ISA' },

  { str:'JER', expect:'JER' },
  { str:'Je', expect:'JER' },
  { str:'Jeremiah', expect:'JER' },
  { str:'Jr', expect:'JER' },

  { str:'LAM', expect:'LAM' },
  { str:'La', expect:'LAM' },
  { str:'Lamentations', expect:'LAM' },
  { str:'Lm', expect:'LAM' },

  { str:'EZK', expect:'EZK' },
  { str:'Ez', expect:'EZK' },
  { str:'Eze', expect:'EZK' },
  { str:'Ezek', expect:'EZK' },
  { str:'Ezekiel', expect:'EZK' },

  { str:'DAN', expect:'DAN' },
  { str:'Da', expect:'DAN' },
  { str:'Daniel', expect:'DAN' },
  { str:'Daniel (Hebrew)', expect:'DAN' },
  { str:'Dn', expect:'DAN' },

  { str:'HOS', expect:'HOS' },
  { str:'Ho', expect:'HOS' },
  { str:'Hosea', expect:'HOS' },
  { str:'Hs', expect:'HOS' },

  { str:'JOL', expect:'JOL' },
  { str:'Joel', expect:'JOL' },
  { str:'Jl', expect:'JOL' },

  { str:'AMO', expect:'AMO' },
  { str:'Am', expect:'AMO' },
  { str:'Amos', expect:'AMO' },

  { str:'OBA', expect:'OBA' },
  { str:'Ob', expect:'OBA' },
  { str:'Obadiah', expect:'OBA' },

  { str:'JON', expect:'JON' },
  { str:'Jonah', expect:'JON' },
  { str:'Jnh', expect:'JON' },

  { str:'MIC', expect:'MIC' },
  { str:'Mi', expect:'MIC' },
  { str:'Micah', expect:'MIC' },
  { str:'Mc', expect:'MIC' },

  { str:'NAM', expect:'NAM' },
  { str:'Na', expect:'NAM' },
  { str:'Nah', expect:'NAM' },
  { str:'Nahum', expect:'NAM' },

  { str:'HAB', expect:'HAB' },
  { str:'Ha', expect:'HAB' },
  { str:'Habakkuk', expect:'HAB' },
  { str:'Hb', expect:'HAB' },

  { str:'ZEP', expect:'ZEP' },
  { str:'Zeph', expect:'ZEP' },
  { str:'Zephaniah', expect:'ZEP' },
  { str:'Zp', expect:'ZEP' },
  { str:'Zph', expect:'ZEP' },

  { str:'HAG', expect:'HAG' },
  { str:'Haggai', expect:'HAG' },
  { str:'Hg', expect:'HAG' },

  { str:'ZEC', expect:'ZEC' },
  { str:'Zech', expect:'ZEC' },
  { str:'Zechariah', expect:'ZEC' },
  { str:'Zc', expect:'ZEC' },
  { str:'Zch', expect:'ZEC' },

  { str:'MAL', expect:'MAL' },
  { str:'Malachi', expect:'MAL' },
  { str:'Ml', expect:'MAL' },

  { str:'MAT', expect:'MAT' },
  { str:'Matt', expect:'MAT' },
  { str:'Matthew', expect:'MAT' },
  { str:'Mt', expect:'MAT' },

  { str:'MRK', expect:'MRK' },
  { str:'Mar', expect:'MRK' },
  { str:'Mark', expect:'MRK' },
  { str:'Mk', expect:'MRK' },

  { str:'LUK', expect:'LUK' },
  { str:'Lu', expect:'LUK' },
  { str:'Luke', expect:'LUK' },
  { str:'Lk', expect:'LUK' },
  { str:'Lke', expect:'LUK' },

  { str:'JHN', expect:'JHN' },
  { str:'Joh', expect:'JHN' },
  { str:'John', expect:'JHN' },
  { str:'Jn', expect:'JHN' },

  { str:'ACT', expect:'ACT' },
  { str:'Ac', expect:'ACT' },
  { str:'Acts', expect:'ACT' },

  { str:'ROM', expect:'ROM' },
  { str:'Ro', expect:'ROM' },
  { str:'Romans', expect:'ROM' },
  { str:'Romns', expect:'ROM' },
  { str:'Rm', expect:'ROM' },
  { str:'Rmans', expect:'ROM' },
  { str:'Rmns', expect:'ROM' },

  { str:'1CO', expect:'1CO' },
  { str:'1 Co', expect:'1CO' },
  { str:'1 Cor', expect:'1CO' },
  { str:'1 Co', expect:'1CO' },
  { str:'1 Cor', expect:'1CO' },
  { str:'1 Corinthians', expect:'1CO' },
  { str:'1st Co', expect:'1CO' },
  { str:'1st Cor', expect:'1CO' },
  { str:'1st Co', expect:'1CO' },
  { str:'1st Cor', expect:'1CO' },
  { str:'1st Corinthians', expect:'1CO' },
  { str:'1Co', expect:'1CO' },
  { str:'1Cor', expect:'1CO' },
  { str:'1Co', expect:'1CO' },
  { str:'1Cor', expect:'1CO' },
  { str:'1Corinthians', expect:'1CO' },

  { str:'2CO', expect:'2CO' },
  { str:'2 Co', expect:'2CO' },
  { str:'2 Cor', expect:'2CO' },
  { str:'2 Co', expect:'2CO' },
  { str:'2 Cor', expect:'2CO' },
  { str:'2 Corinthians', expect:'2CO' },
  { str:'2nd Co', expect:'2CO' },
  { str:'2nd Cor', expect:'2CO' },
  { str:'2nd Co', expect:'2CO' },
  { str:'2nd Cor', expect:'2CO' },
  { str:'2nd Corinthians', expect:'2CO' },
  { str:'2Co', expect:'2CO' },
  { str:'2Cor', expect:'2CO' },
  { str:'2Co', expect:'2CO' },
  { str:'2Cor', expect:'2CO' },
  { str:'2Corinthians', expect:'2CO' },

  { str:'GAL', expect:'GAL' },
  { str:'Galatians', expect:'GAL' },

  { str:'EPH', expect:'EPH' },
  { str:'Ephesians', expect:'EPH' },

  { str:'PHP', expect:'PHP' },
  { str:'Ph', expect:'PHP' },
  { str:'Philippians', expect:'PHP' },

  { str:'COL', expect:'COL' },
  { str:'Colossians', expect:'COL' },
  { str:'Cl', expect:'COL' },

  { str:'1TH', expect:'1TH' },
  { str:'1 Th', expect:'1TH' },
  { str:'1 The', expect:'1TH' },
  { str:'1 Thes', expect:'1TH' },
  { str:'1 Thess', expect:'1TH' },
  { str:'1 Thessalonians', expect:'1TH' },
  { str:'1st Th', expect:'1TH' },
  { str:'1st The', expect:'1TH' },
  { str:'1st Thes', expect:'1TH' },
  { str:'1st Thess', expect:'1TH' },
  { str:'1st Thessalonians', expect:'1TH' },
  { str:'1Th', expect:'1TH' },
  { str:'1The', expect:'1TH' },
  { str:'1Thes', expect:'1TH' },
  { str:'1Thess', expect:'1TH' },
  { str:'1Thessalonians', expect:'1TH' },

  { str:'2TH', expect:'2TH' },
  { str:'2 Th', expect:'2TH' },
  { str:'2 The', expect:'2TH' },
  { str:'2 Thes', expect:'2TH' },
  { str:'2 Thess', expect:'2TH' },
  { str:'2 Thessalonians', expect:'2TH' },
  { str:'2nd Th', expect:'2TH' },
  { str:'2nd The', expect:'2TH' },
  { str:'2nd Thes', expect:'2TH' },
  { str:'2nd Thess', expect:'2TH' },
  { str:'2nd Thessalonians', expect:'2TH' },
  { str:'2Th', expect:'2TH' },
  { str:'2The', expect:'2TH' },
  { str:'2Thes', expect:'2TH' },
  { str:'2Thess', expect:'2TH' },
  { str:'2Thessalonians', expect:'2TH' },

  { str:'1TI', expect:'1TI' },
  { str:'1 Ti', expect:'1TI' },
  { str:'1 Tim', expect:'1TI' },
  { str:'1 Timothy', expect:'1TI' },
  { str:'1 Tm', expect:'1TI' },
  { str:'1 Tmothy', expect:'1TI' },
  { str:'1st Ti', expect:'1TI' },
  { str:'1st Tim', expect:'1TI' },
  { str:'1st Timothy', expect:'1TI' },
  { str:'1st Tm', expect:'1TI' },
  { str:'1st Tmothy', expect:'1TI' },
  { str:'1Ti', expect:'1TI' },
  { str:'1Tim', expect:'1TI' },
  { str:'1Timothy', expect:'1TI' },
  { str:'1Tm', expect:'1TI' },
  { str:'1Tmothy', expect:'1TI' },

  { str:'2TI', expect:'2TI' },
  { str:'2 Ti', expect:'2TI' },
  { str:'2 Tim', expect:'2TI' },
  { str:'2 Timothy', expect:'2TI' },
  { str:'2 Tm', expect:'2TI' },
  { str:'2 Tmothy', expect:'2TI' },
  { str:'2nd Ti', expect:'2TI' },
  { str:'2nd Tim', expect:'2TI' },
  { str:'2nd Timothy', expect:'2TI' },
  { str:'2nd Tm', expect:'2TI' },
  { str:'2nd Tmothy', expect:'2TI' },
  { str:'2Ti', expect:'2TI' },
  { str:'2Tim', expect:'2TI' },
  { str:'2Timothy', expect:'2TI' },
  { str:'2Tm', expect:'2TI' },
  { str:'2Tmothy', expect:'2TI' },

  { str:'TIT', expect:'TIT' },
  { str:'Titus', expect:'TIT' },
  { str:'Tt', expect:'TIT' },

  { str:'PHM', expect:'PHM' },
  { str:'Philemon', expect:'PHM' },
  { str:'Pm', expect:'PHM' },

  { str:'HEB', expect:'HEB' },
  { str:'He', expect:'HEB' },
  { str:'Hebrews', expect:'HEB' },

  { str:'JAS', expect:'JAS' },
  { str:'Jam', expect:'JAS' },
  { str:'James', expect:'JAS' },
  { str:'Jms', expect:'JAS' },

  { str:'1PE', expect:'1PE' },
  { str:'1 Pe', expect:'1PE' },
  { str:'1 Peter', expect:'1PE' },
  { str:'1 Pt', expect:'1PE' },
  { str:'1 Ptr', expect:'1PE' },
  { str:'1st Pe', expect:'1PE' },
  { str:'1st Peter', expect:'1PE' },
  { str:'1st Pt', expect:'1PE' },
  { str:'1st Ptr', expect:'1PE' },
  { str:'1Pe', expect:'1PE' },
  { str:'1Peter', expect:'1PE' },
  { str:'1Pt', expect:'1PE' },
  { str:'1Ptr', expect:'1PE' },

  { str:'2PE', expect:'2PE' },
  { str:'2 Pe', expect:'2PE' },
  { str:'2 Peter', expect:'2PE' },
  { str:'2 Pt', expect:'2PE' },
  { str:'2 Ptr', expect:'2PE' },
  { str:'2nd Pe', expect:'2PE' },
  { str:'2nd Peter', expect:'2PE' },
  { str:'2nd Pt', expect:'2PE' },
  { str:'2nd Ptr', expect:'2PE' },
  { str:'2Pe', expect:'2PE' },
  { str:'2Peter', expect:'2PE' },
  { str:'2Pt', expect:'2PE' },
  { str:'2Ptr', expect:'2PE' },

  { str:'1JN', expect:'1JN' },
  { str:'1 Jo', expect:'1JN' },
  { str:'1 Jn', expect:'1JN' },
  { str:'1 John', expect:'1JN' },
  { str:'1st Jo', expect:'1JN' },
  { str:'1st Jn', expect:'1JN' },
  { str:'1st John', expect:'1JN' },
  { str:'1Jo', expect:'1JN' },
  { str:'1Jn', expect:'1JN' },
  { str:'1John', expect:'1JN' },

  { str:'2JN', expect:'2JN' },
  { str:'2 Jo', expect:'2JN' },
  { str:'2 Jn', expect:'2JN' },
  { str:'2 John', expect:'2JN' },
  { str:'2nd Jo', expect:'2JN' },
  { str:'2nd Jn', expect:'2JN' },
  { str:'2nd John', expect:'2JN' },
  { str:'2Jo', expect:'2JN' },
  { str:'2Jn', expect:'2JN' },
  { str:'2John', expect:'2JN' },

  { str:'3JN', expect:'3JN' },
  { str:'3 Jo', expect:'3JN' },
  { str:'3 Jn', expect:'3JN' },
  { str:'3 John', expect:'3JN' },
  { str:'3rd Jo', expect:'3JN' },
  { str:'3rd Jn', expect:'3JN' },
  { str:'3rd John', expect:'3JN' },
  { str:'3Jo', expect:'3JN' },
  { str:'3Jn', expect:'3JN' },
  { str:'3John', expect:'3JN' },

  { str:'JUD', expect:'JUD' },
  { str:'Jude', expect:'JUD' },
  { str:'Jd', expect:'JUD' },

  { str:'REV', expect:'REV' },
  { str:'Revelation', expect:'REV' },
  { str:'Revelations', expect:'REV' },
  { str:'Rv', expect:'REV' },

  { str:'TOB', expect:'TOB' },
  { str:'Tobit', expect:'TOB' },
  { str:'Tb', expect:'TOB' },

  { str:'JDT', expect:'JDT' },
  { str:'Judith', expect:'JDT' },

  { str:'WIS', expect:'WIS' },
  { str:'Ws', expect:'WIS' },
  { str:'Wisdom', expect:'WIS' },
  { str:'Wsdom', expect:'WIS' },
  { str:'Wisdom of Solomon', expect:'WIS' },
  { str:'Wsdom of Solomon', expect:'WIS' },

  { str:'SIR', expect:'SIR' },
  { str:'Sirach', expect:'SIR' },
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
