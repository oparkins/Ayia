/* Source: Unified Scripture XML 3.0
 *  https://ubsicap.github.io/usx/vocabularies.html
 *
 * Order:
 *  https://www.usccb.org/offices/new-american-bible/books-bible
 *
 */
const BookMap = {
  // Old Testament (OT) {
  'GEN': {
    name  : 'Genesis',        // full name
    alts  : [ 'Gn' ],         // alternate name matches
    // defeat: [ ... ],       // matches that should be ignored/defeated
    order : 1,                // cannoical order (null == not in cannon)
    loc   : 'Old Testament',  // location/section
    /*
     * Each `verses` array holds the numbers of verses for each chapter and
     * includes a place-holder at index 0. This allows direct mapping using the
     * target chapter number (e.g. chapter 1 === index 1).
     *
     * The chapter count is the length of the array - 1.
     *
     * :NOTE: Below we have identified differences between chapter and verse
     *        counts between what we have (for NIV) and what the Catholic data
     *        set specifies. These appear as '^##' which identifies a
     *        difference in verse numbers for a specific chapter.
     *
     * Example:
     *    GEN   === 50 chapters (51 entries - 1 );
     *    GEN.1 === 31
     *
     *     0:     1   2   3   4   5   6   7   8   9   10  11  12  13  14
     *     1: 15  16  17  18  19  20  21  22  23  24  25  26  27  28  29
     *     2: 30  31  32  33  34  35  36  37  38  39  40  41  42  43  44
     *     3: 45  46  47  48  49  50  51  52  53  54  55  56  57  58  59
     *     4: 60  61  62  63  64  65  66  67  68  69  70  71  72  73  74
     *     5: 75  76  77  78  79  80  81  82  83  84  85  86  87  88  89
     *     6: 90  91  92  93  94  95  96  97  98  99  100 101 102 103 104
     *     7: 105 106 107 108 109 110 111 112 113 114 115 116 117 118 119
     *     8: 120 121 122 123 124 125 126 127 128 129 130 131 132 133 134
     *     9: 135 136 137 138 139 140 141 142 143 144 145 146 147 148 149
     *    10: 150                                                         */
    verses: [ 0,  31, 25, 24, 26, 32, 22, 24, 22, 29, 32, 32, 20, 18, 24,
              21, 16, 27, 33, 38, 18, 34, 24, 20, 67, 34, 35, 46, 22, 35,
              43, 55, 32, 20, 31, 29, 43, 36, 30, 23, 23, 57, 38, 34, 34,
        //        ^54 ^33
              28, 34, 31, 22, 33, 26,
        // === Ours is correct for NIV
    ],
  },
  'EXO': {
    name  : 'Exodus',
    order : 2,
    loc   : 'Old Testament',
    verses: [ 0,  22, 25, 22, 31, 23, 30, 25, 32, 35, 29, 10, 51, 22, 31,
        //                                ^29 ^28
              27, 36, 16, 27, 25, 26, 36, 31, 33, 18, 40, 37, 21, 43, 46,
        //                            ^37 ^30
              38, 18, 35, 23, 35, 35, 38, 29, 31, 43, 38,
        // === Ours is correct for NIV
    ],
  },
  'LEV': {
    name  : 'Leviticus',
    alts  : [ /* 'Le', */ 'Lv' ],
    order : 3,
    loc   : 'Old Testament',
    verses: [ 0,  17, 16, 17, 35, 19, 30, 38, 36, 24, 20, 47,  8, 59, 57,
        //                        ^26 ^23
              33, 34, 16, 30, 37, 27, 24, 33, 44, 23, 55, 46, 34,
        // === Ours is correct for NIV
    ],
  },
  'NUM': {
    name  : 'Numbers',
    alts  : [ 'Nm' ],
    order : 4,
    loc   : 'Old Testament',
    verses: [ 0,  54, 34, 51, 49, 31, 27, 89, 26, 23, 36, 35, 16, 33, 45,
              41, 50, 13, 32, 22, 29, 35, 41, 30, 25, 18, 65, 23, 31, 40,
        //        ^35 ^28                             ^19             ^39
              16, 54, 42, 56, 29, 34, 13,
        //    ^17
        // === Ours is correct for NIV
    ],
  },
  'DEU': {
    name  : 'Deuteronomy',
    alts  : [ 'Dt' ],
    order : 5,
    loc   : 'Old Testament',
    verses: [ 0,  46, 37, 29, 49, 33, 25, 26, 20, 29, 22, 32, 32, 18, 29,
        //                                                    ^31 ^19
              23, 22, 20, 22, 21, 20, 23, 30, 25, 22, 19, 19, 26, 68, 29,
        //                                ^29 ^26                 ^69 ^29
              20, 30, 52, 29, 12,
        // === Ours is correct for NIV
    ],
  },
  'JOS': {
    name  : 'Joshua',
    alts  : [ 'Js' ],
    order : 6,
    loc   : 'Old Testament',
    verses: [ 0,  18, 24, 17, 24, 15, 27, 26, 35, 27, 43, 23, 24, 33, 15,
              63, 10, 18, 28, 51, 9,  45, 34, 16, 33,
    ],
  },
  'JDG': {
    name  : 'Judges',
    alts  : [ 'Jg' ],
    order : 7,
    loc   : 'Old Testament',
    verses: [ 0,  36, 23, 31, 24, 31, 40, 25, 35, 57, 18, 40, 15, 25, 20,
              20, 31, 13, 31, 30, 48, 25,
    ],
  },
  'RUT': {
    name  : 'Ruth',
    alts  : [ 'Rt' ],
    order : 8,
    loc   : 'Old Testament',
    verses: [ 0,  22, 23, 18, 22 ],
  },
  '1SA': {
    name  : '1 Samuel',
    alts  : [ '1Sm', '1 Sm' ],
    order : 9,
    loc   : 'Old Testament',
    verses: [ 0,  28, 36, 21, 22, 12, 21, 17, 22, 27, 27, 15, 25, 23, 52,
              35, 23, 58, 30, 24, 42, 15, 23, 29, 22, 44, 25, 12, 25, 11,
        //                                    ^28 ^23 ^43
              31, 13,
        // === Ours is correct for NIV
    ],
  },
  '2SA': {
    name  : '2 Samuel',
    alts  : [ '2Sm', '2 Sm' ],
    order : 10,
    loc   : 'Old Testament',
    verses: [ 0,  27, 32, 39, 12, 25, 23, 29, 18, 13, 19, 27, 31, 39, 33,
              37, 23, 29, 33, 43, 26, 22, 51, 39, 25,
        //                ^32 ^44
        // === Ours is correct for NIV
    ],
  },
  '1KI': {
    name  : '1 Kings',
    alts  : [ '1Kg', '1 Kg', '1Kgs', '1 Kgs' ],
    order : 11,
    loc   : 'Old Testament',
    verses: [ 0,  53, 46, 28, 34, 18, 38, 51, 66, 28, 29, 43, 33, 34, 31,
        //                    ^20 ^32
              34, 34, 24, 46, 21, 43, 29, 53,
        //                                ^54
        // === Ours is correct for NIV
    ],
  },
  '2KI': {
    name  : '2 Kings',
    alts  : [ '2Kg', '2 Kg', '2Kgs', '2 Kgs' ],
    order : 12,
    loc   : 'Old Testament',
    verses: [ 0,  18, 25, 27, 44, 27, 33, 20, 29, 37, 36, 21, 21, 25, 29,
        //                                                ^20 ^22
              38, 20, 41, 37, 37, 21, 26, 20, 37, 20, 30,
        // === Ours is correct for NIV
    ],
  },
  '1CH': {
    name  : '1 Chronicles',
    alts  : [ '1Chr', '1 Chr' ],
    order : 13,
    loc   : 'Old Testament',
    verses: [ 0,  54, 55, 24, 43, 26, 81, 40, 40, 44, 14, 47, 40, 14, 17,
        //                        ^41 ^66                     ^41
              29, 43, 27, 17, 19, 8,  30, 19, 32, 31, 31, 32, 34, 21, 30,
        // === Ours is correct for NIV
    ],
  },
  '2CH': {
    name  : '2 Chronicles',
    alts  : [ '2Chr', '2 Chr' ],
    order : 14,
    loc   : 'Old Testament',
    verses: [ 0,  17, 18, 17, 22, 14, 42, 22, 18, 31, 19, 23, 16, 22, 15,
        //        ^18 ^17                                         ^23 ^14
              19, 14, 19, 34, 11, 37, 20, 12, 21, 27, 28, 23, 9,  27, 36,
              27, 21, 33, 25, 33, 27, 23,
        //                        ^26
        // === Ours is correct for NIV
    ],
  },
  'EZR': {
    name  : 'Ezra',
    alts  : [ 'Er' ],
    defeat: [ 'Ez' ],
    order : 15,
    loc   : 'Old Testament',
    verses: [ 0,  11, 70, 13, 24, 17, 22, 28, 36, 15, 44 ],
  },
  'NEH': {
    name  : 'Nehemiah',
    alts  : [ 'Nh' ],
    order : 16,
    loc   : 'Old Testament',
    verses: [ 0,  11, 20, 32, 23, 19, 19, 73, 18, 38, 39, 36, 47, 31 ],
        //                    ^17         ^72     ^37 ^40
        // === Ours is correct for NIV
  },
  'EST': {
    name  : 'Esther',
    alts  : [ 'Esther (Hebrew)' ],
    order : 17,
    loc   : 'Old Testament',
    verses: [ 0,  22, 23, 15, 17, 14, 14, 10, 17, 32, 3 ],
        // 10 chapters here, 16 expected
        // === Ours is correct for NIV
  },
  'JOB': {
    name  : 'Job',
    alts  : [ 'Jb' ],
    order : 18,
    loc   : 'Old Testament',
    verses: [ 0,  22, 13, 26, 21, 27, 30, 21, 22, 35, 22, 20, 25, 28, 22,
              35, 22, 16, 21, 29, 29, 34, 30, 17, 25, 6,  14, 23, 28, 25,
        //                                                    ^21
              31, 40, 22, 33, 37, 16, 33, 24, 41, 30, 24, 34, 17,
        //                                            ^32 ^26
        // === Ours is correct for NIV
    ],
  },
  'PSA': {
    name  : 'Psalms',
    order : 19,
    loc   : 'Old Testament',
    verses: [ 0,   6, 12,  8,  8, 12, 10, 17,  9, 20, 18,  7,  8,  6,  7,
        //            ^11 ^9  ^9  ^13 ^11 ^18 ^10 ^21         ^9
              5,  11, 15, 50, 14, 9,  13, 31,  6, 10, 22, 12, 14,  9, 11,
        //                ^51 ^15 ^10 ^14 ^32             ^11
              12, 24, 11, 22, 22, 28, 12, 40, 22, 13, 17, 13, 11,  5, 26,
        //    ^13 ^25         ^23     ^13     ^23 ^14 ^18 ^14 ^12     ^27
              17, 11,  9, 14, 20, 23, 19,  9,  6,  7, 23, 13, 11, 11, 17,
        //    ^18 ^12 ^10 ^15 ^21     ^21 ^11 ^7  ^9  ^24 ^14 ^12 ^12 ^18
              12,  8, 12, 11, 10, 13, 20,  7, 35, 36, 5,  24, 20, 28, 23,
        //    ^14 ^9  ^13 ^12 ^11 ^14     ^8  ^36 ^37 ^6  
              10, 12, 20, 72, 13, 19, 16,  8, 18, 12, 13, 17,  7, 18, 52,
        //    ^11 ^13 ^21         ^20 ^17     ^19 ^13 ^14         ^19 ^53
              17, 16, 15,  5, 23, 11, 13, 12,  9,  9, 5,   8, 28, 22, 35,
        //            ^16                                     ^29
              45, 48, 43, 13, 31, 7,  10, 10,  9,  8, 18, 19,  2, 29, 176,
        //                ^14
              7,   8,  9,  4,  8, 5,   6,  5,  6,  8, 8,   3, 18,  3,  3,
              21, 26,  9,  8, 24, 13, 10,  7, 12, 15, 21, 10, 20, 14,  9,
        //                        ^14       ^8
              6,
        // === Ours is correct for NIV (at least for vv 2-9, 12, 18-22, 26,
        //                                              140, 142)
    ],
  },
  'PRO': {
    name  : 'Proverbs',
    order : 20,
    loc   : 'Old Testament',
    verses: [ 0,  33, 22, 35, 27, 23, 35, 27, 36, 18, 32, 31, 28, 25, 35,
              33, 33, 28, 24, 29, 30, 31, 29, 35, 34, 28, 28, 27, 28, 27,
              33, 31,
    ],
  },
  'ECC': {
    name  : 'Ecclesiastes',
    order : 21,
    loc   : 'Old Testament',
    verses: [ 0,  18, 26, 22, 16, 20, 12, 29, 17, 18, 20, 10, 14 ],
        //                    ^17 ^19
        // === Ours is correct for NIV
  },
  'SNG': {
    name  : 'Song of Songs',
    alts  : [ 'Song of Solomon', 'Sgs', 'Sg' ],
    order : 22,
    loc   : 'Old Testament',
    verses: [ 0,  17, 17, 11, 16, 16, 13, 13, 14 ],
        //                            ^12 ^14
        // === Ours is correct for NIV
  },
  'ISA': {
    name  : 'Isaiah',
    order : 23,
    loc   : 'Old Testament',
    verses: [ 0,  31, 22, 26, 6,  30, 13, 25, 22, 21, 34, 16, 6,  22, 32,
        //                                    ^23 ^20
              9,  14, 14, 7,  25, 6,  17, 25, 18, 23, 12, 21, 13, 29, 24,
              33, 9,  20, 24, 17, 10, 22, 38, 22, 8,  31, 29, 25, 28, 28,
              25, 13, 15, 22, 26, 11, 23, 15, 12, 17, 13, 12, 21, 14, 21,
              22, 11, 12, 19, 12, 25, 24,
        //                    ^11
        // === Ours is correct for NIV
    ],
  },
  'JER': {
    name  : 'Jeremiah',
    alts  : [ 'Jr' ],
    order : 24,
    loc   : 'Old Testament',
    verses: [ 0,  19, 37, 25, 31, 31, 30, 34, 22, 26, 25, 23, 17, 27, 22,
        //                                    ^23 ^25
              21, 21, 27, 23, 15, 18, 14, 30, 40, 10, 38, 24, 22, 17, 32,
              24, 40, 44, 26, 22, 19, 32, 21, 28, 18, 16, 18, 22, 13, 30,
              5,  28,  7, 47, 39, 46, 64, 34,
        // === Ours is correct for NIV
    ],
  },
  'LAM': {
    name  : 'Lamentations',
    alts  : [ 'Lm' ],
    order : 25,
    loc   : 'Old Testament',
    verses: [ 0,  22, 22, 66, 22, 22 ],
  },
  'EZK': {
    name  : 'Ezekiel',
    alts  : [ 'Ez' ],
    order : 26,
    loc   : 'Old Testament',
    verses: [ 0,  28, 10, 27, 17, 17, 14, 27, 18, 11, 22, 25, 28, 23, 23,
              8,  63, 24, 32, 14, 49, 32, 31, 49, 27, 17, 21, 36, 26, 21,
        //                        ^44 ^37
              26, 18, 32, 33, 31, 15, 38, 28, 23, 29, 49, 26, 20, 27, 31,
              25, 24, 23, 35,
        // === Ours is correct for NIV
    ],
  },
  'DAN': {
    name  : 'Daniel',
    alts  : [ 'Daniel (Hebrew)', 'Dn' ],
    order : 27,
    loc   : 'Old Testament',
    verses: [ 0,  21, 49, 30, 37, 31, 28, 28, 27, 27, 21, 45, 13 ],
        //                ^100^34 ^30 ^29
        // 12 chapters here, 14 expected
        // === Ours is correct for NIV
  },
  'HOS': {
    name  : 'Hosea',
    alts  : [ 'Hs' ],
    order : 28,
    loc   : 'Old Testament',
    verses: [ 0,  11, 23, 5,  19, 15, 11, 16, 14, 17, 15, 12, 14, 16, 9 ],
        //        ^9  ^25                                 ^11 ^15 ^15 ^10
        // === Ours is correct for NIV
  },
  'JOL': {
    name  : 'Joel',
    alts  : [ 'Jl' ],
    order : 29,
    loc   : 'Old Testament',
    verses: [ 0,  20, 32, 21 ],
        //            ^27 ^5
        // 3 chapters here, 4 expected
        // === Ours is correct for NIV
  },
  'AMO': {
    name  : 'Amos',
    order : 30,
    loc   : 'Old Testament',
    verses: [ 0,  15, 16, 15, 13, 27, 14, 17, 14, 15 ],
  },
  'OBA': {
    name  : 'Obadiah',
    order : 31,
    loc   : 'Old Testament',
    verses: [ 0,  21 ],
  },
  'JON': {
    name  : 'Jonah',
    alts  : [ 'Jnh' ],
    order : 32,
    loc   : 'Old Testament',
    verses: [ 0,  17, 10, 10, 11 ],
        //        ^16 ^11
        // === Ours is correct for NIV
  },
  'MIC': {
    name  : 'Micah',
    alts  : [ 'Mc' ],
    order : 33,
    loc   : 'Old Testament',
    verses: [ 0,  16, 13, 12, 13, 15, 16, 20 ],
        //                    ^14 ^14
        // === Ours is correct for NIV
  },
  'NAM': {
    name  : 'Nahum',
    order : 34,
    loc   : 'Old Testament',
    verses: [ 0,  15, 13, 19 ],
        //        ^14 ^14
        // === Ours is correct for NIV
  },
  'HAB': {
    name  : 'Habakkuk',
    alts  : [ 'Hb' ],
    order : 35,
    loc   : 'Old Testament',
    verses: [ 0,  17, 20, 19 ],
  },
  'ZEP': {
    name  : 'Zephaniah',
    alts  : [ 'Zp', 'Zph' ],
    order : 36,
    loc   : 'Old Testament',
    verses: [ 0,  18, 15, 20 ],
  },
  'HAG': {
    name  : 'Haggai',
    alts  : [ 'Hg' ],
    order : 37,
    loc   : 'Old Testament',
    verses: [ 0,  15, 23 ],
  },
  'ZEC': {
    name  : 'Zechariah',
    alts  : [ 'Zc', 'Zch' ],
    order : 38,
    loc   : 'Old Testament',
    verses: [ 0,  21, 13, 10, 14, 11, 15, 14, 23, 17, 12, 17, 14,  9, 21 ],
        //        ^17 ^17
        // === Ours is correct for NIV
  },
  'MAL': {
    name  : 'Malachi',
    alts  : [ 'Ml' ],
    order : 39,
    loc   : 'Old Testament',
    verses: [ 0,  14, 17, 18,  6 ],
        //                ^24
        // 4 chapters here, 3 expected
        // === Ours is correct for NIV
  },
  // Old Testament (OT) }
  // New Testament (NT) {
  'MAT': {
    name  : 'Matthew',
    alts  : [ 'Mt' ],
    order : 40,
    loc   : 'New Testament',
    verses: [ 0,  25, 23, 17, 25, 48, 34, 29, 34, 38, 42, 30, 50, 58, 36,
              39, 28, 27, 35, 30, 34, 46, 46, 39, 51, 46, 75, 66, 20,
    ],
  },
  'MRK': {
    name  : 'Mark',
    alts  : [ 'Mk' ],
    order : 41,
    loc   : 'New Testament',
    verses: [ 0,  45, 28, 35, 41, 43, 56, 37, 38, 50, 52, 33, 44, 37,
              72, 47, 20,
    ],
  },
  'LUK': {
    name  : 'Luke',
    alts  : [ 'Lk' ],
    order : 42,
    loc   : 'New Testament',
    verses: [ 0,  80, 52, 38, 44, 39, 49, 50, 56, 62, 42, 54, 59, 35, 35,
              32, 31, 37, 43, 48, 47, 38, 71, 56, 53,
    ],
  },
  'JHN': {
    name  : 'John',
    alts  : [ 'Jn' ],
    order : 43,
    loc   : 'New Testament',
    verses: [ 0,  51, 25, 36, 54, 47, 71, 53, 59, 41, 42, 57, 50, 38, 31,
              27, 33, 26, 40, 42, 31, 25,
    ],
  },
  'ACT': {
    name  : 'Acts',
    order : 44,
    loc   : 'New Testament',
    verses: [ 0,  26, 47, 26, 37, 42, 15, 60, 40, 43, 48, 30, 25, 52, 28,
              41, 40, 34, 28, 41, 38, 40, 30, 35, 27, 27, 32, 44, 31,
        //                    ^40
        // === Ours is correct for NIV
    ],
  },
  'ROM': {
    name  : 'Romans',
    alts  : [ 'Rm' ],
    order : 45,
    loc   : 'New Testament',
    verses: [ 0,  32, 29, 31, 25, 21, 23, 25, 39, 33, 21, 36, 21, 14,
              23, 33, 27,
    ],
  },
  '1CO': {
    name  : '1 Corinthians',
    order : 46,
    loc   : 'New Testament',
    verses: [ 0,  31, 16, 23, 21, 13, 20, 40, 13, 27, 33, 34, 31, 13, 40,
              58, 24,
    ],
  },
  '2CO': {
    name  : '2 Corinthians',
    order : 47,
    loc   : 'New Testament',
    verses: [ 0,  24, 17, 18, 18, 21, 18, 16, 24, 15, 18, 33, 21, 14 ],
        //                                                        ^13
        // === Ours is correct for NIV
  },
  'GAL': {
    name  : 'Galatians',
    order : 48,
    loc   : 'New Testament',
    verses: [ 0,  24, 21, 29, 31, 26, 18 ],
  },
  'EPH': {
    name  : 'Ephesians',
    order : 49,
    loc   : 'New Testament',
    verses: [ 0,  23, 22, 21, 32, 33, 24 ],
  },
  'PHP': {
    name  : 'Philippians',
    order : 50,
    loc   : 'New Testament',
    verses: [ 0,  30, 30, 21, 23 ],
  },
  'COL': {
    name  : 'Colossians',
    alts  : [ 'Cl' ],
    order : 51,
    loc   : 'New Testament',
    verses: [ 0,  29, 23, 25, 18 ],
  },
  '1TH': {
    name  : '1 Thessalonians',
    order : 52,
    loc   : 'New Testament',
    verses: [ 0,  10, 20, 13, 18, 28 ],
  },
  '2TH': {
    name  : '2 Thessalonians',
    order : 53,
    loc   : 'New Testament',
    verses: [ 0,  12, 17, 18 ],
  },
  '1TI': {
    name  : '1 Timothy',
    alts  : [ '1Tm', '1 Tm' ],
    order : 54,
    loc   : 'New Testament',
    verses: [ 0,  20, 15, 16, 16, 25, 21 ],
  },
  '2TI': {
    name  : '2 Timothy',
    alts  : [ '2Tm', '2 Tm' ],
    order : 55,
    loc   : 'New Testament',
    verses: [ 0,  18, 26, 17, 22 ],
  },
  'TIT': {
    name  : 'Titus',
    alts  : [ 'Tt' ],
    order : 56,
    loc   : 'New Testament',
    verses: [ 0,  16, 15, 15 ],
  },
  'PHM': {
    name  : 'Philemon',
    alts  : [ 'Pm' ],
    order : 57,
    loc   : 'New Testament',
    verses: [ 0,  25 ],
  },
  'HEB': {
    name  : 'Hebrews',
    //alts  : [ 'He' ],
    order : 58,
    loc   : 'New Testament',
    verses: [ 0,  14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25 ],
  },
  'JAS': {
    name  : 'James',
    alts  : [ 'Jms' ],
    order : 59,
    loc   : 'New Testament',
    verses: [ 0,  27, 26, 18, 17, 20 ],
  },
  '1PE': {
    name  : '1 Peter',
    alts  : [ '1Pt', '1 Pt' ],
    order : 60,
    loc   : 'New Testament',
    verses: [ 0,  25, 25, 22, 19, 14 ],
  },
  '2PE': {
    name  : '2 Peter',
    alts  : [ '2Pt', '2 Pt' ],
    order : 61,
    loc   : 'New Testament',
    verses: [ 0,  21, 22, 18 ],
  },
  '1JN': {
    name  : '1 John',
    alts  : [ '1 Jn' ],
    order : 62,
    loc   : 'New Testament',
    verses: [ 0,  10, 29, 24, 21, 21 ],
  },
  '2JN': {
    name  : '2 John',
    alts  : [ '2 Jn' ],
    order : 63,
    loc   : 'New Testament',
    verses: [ 0, 13 ],
  },
  '3JN': {
    name  : '3 John',
    alts  : [ '3 Jn' ],
    order : 64,
    loc   : 'New Testament',
    verses: [ 0, 15 ],
  },
  'JUD': {
    name  : 'Jude',
    alts  : [ 'Jd' ],
    order : 65,
    loc   : 'New Testament',
    verses: [ 0,  25 ],
  },
  'REV': {
    name  : 'Revelation',
    alts  : [ 'Rv' ],
    order : 66,
    loc   : 'New Testament',
    verses: [ 0,  20, 29, 22, 11, 14, 17, 17, 13, 21, 11, 19, 17, 18, 20,  8,
              21, 18, 24, 21, 15, 27, 21,
    ],
  },
  // New Testament (NT) }
  // Deuterocanon (DC) {
  //  :XXX: Don't currently have information about chapters/verses
  'TOB': {
    name  : 'Tobit',
    alts  : [ 'Tb' ],
    order : 16.1,             // Between: Nehemiah (16) and Ester (17)
    loc   : 'Deuterocanon',
    verses: [ 0,  22, 14, 17, 21, 22, 18, 17, 21, 6, 14, 18, 22, 18, 15 ],
  },
  'JDT': {
    name  : 'Judith',
    order : 16.2,             // Between: Nehemiah (16) and Ester (17)
    loc   : 'Deuterocanon',
    verses: [ 0,  22, 14, 17, 21, 22, 18, 17, 21, 6, 14, 18, 22, 18, 15 ],
  },
  'WIS': {
    name  : 'Wisdom of Solomon',
    alts  : [ 'Ws' ],
    order : 22.1,             // Between: Song of Songs (22) and Isaiah (23)
    loc   : 'Deuterocanon',
    verses: [ 0,  16, 24, 19, 20, 23, 25, 30, 21, 18, 21, 26, 27, 19, 31,
              19, 29, 21, 25, 22 ],
  },
  'SIR': {
    name  : 'Sirach (Ecclesiasticus)',
    order : 22.2,             // Between: Song of Songs (22) and Isaiah (23)
    loc   : 'Deuterocanon',
    verses: [ 0,  29, 18, 30, 31, 17, 37, 36, 19, 18, 30, 34, 18, 25, 27,
              20, 28, 27, 33, 26, 30, 28, 27, 27, 31, 25, 20, 30, 26, 28,
              25, 31, 24, 33, 26, 24, 27, 30, 34, 35, 30, 24, 25, 35, 23,
              26, 20, 25, 25, 16, 29, 30 ],
  },
  'BAR': {
    name  : 'Baruch',
    order : 25.1,             // Between: Lamentations (25) and Ezekiel (26)
    loc   : 'Deuterocanon',
    verses: [ 0,  22, 35, 38, 37, 9, 72 ],
  },

  // NOT in the cannon
  'ESG': { name: 'Esther Greek',            order : 17.1,loc: 'Deuterocanon' },
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
 *            { abbr    : The abbreviated book name {String},
 *              name    : The full name of the book {String},
 *              loc     : The location of the book {String},
 *              [order] : The canonical order of the book {String};
 *              [verses]: The number of verses per chapter {Array};
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
  return { abbr: ABBR, ...entry };
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

/**
 *  Fetch the number of chapters for the given book.
 *  @method getChapters
 *  @param  book  The desired book {String};
 *
 *  @return The number of chapters (< 1 if no book) {Number};
 */
function getChapters( book ) {
  const entry = BookMap[ book ];

  if (entry == null || ! Array.isArray(entry.verses))  { return -1 }

  return entry.verses.length - 1;
}

/**
 *  Fetch the number of verses for the given book and chapter.
 *  @method getVerses
 *  @param  book    The desired book {String};
 *  @param  chapter The target chapter {Number};
 *
 *  @return The number of verses (< 1 if no book/chapter) {Number};
 */
function getVerses( book, chapter ) {
  const entry = BookMap[ book ];
  if (entry == null || ! Array.isArray(entry.verses))  { return -1 }

  const verses  = entry.verses[ chapter ];

  return (verses == null ? -1 : verses);
}

/**
 *  Fetch the canonical abbreviation of the given book string.
 *  @method nameToABBR
 *  @param  name    The given name {String};
 *
 *  :NOTE: This only matches the full name or abbreviation.
 *
 *  @return The canonical abbreviation or null if not found {String};
 */
function nameToABBR( name ) {
  if (typeof(name) !== 'string')  { return }

  if (name.startsWith('1st')) { name = name.replace(/^1st/, '1') }
  if (name.startsWith('2nd')) { name = name.replace(/^2nd/, '2') }
  if (name.startsWith('3rd')) { name = name.replace(/^3rd/, '3') }

  const ABBR  = name.toUpperCase();
  let   keyMatch;

  Object.entries( BookMap ).find( ([key, entry]) => {
    if (Array.isArray(entry.defeat) && entry.defeat.includes( name )) {
      return;
    }
    if (key === ABBR || (name.length > 2 && entry.name.startsWith( name ))) {
      keyMatch = key;
      return true;
    }
    if (Array.isArray(entry.alts) && entry.alts.includes( name )) {
      keyMatch = key;
      return true;
    }
  });
  return keyMatch;
}

module.exports  = {
  getBook,
  getBooks,
  getChapters,
  getVerses,

  nameToABBR,
};
// vi: ft=javascript
