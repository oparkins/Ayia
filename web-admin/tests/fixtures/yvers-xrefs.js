const tests = [
  /*************************************************************************
   * note.f {
   */
  { version: 'AMP', usfm: '1CH.1.1', type: 'note.f',
    texts: [
      'Saul’s son, Ish-bosheth, ruled over the tribes of Israel for '
      + 'two tumultuous years after his father’s death. His '
      + 'assassination (2 Sam 4) triggered Israel’s appeal to David.'
    ],
    expect: [
      'Saul’s son, Ish-bosheth, ruled over the tribes of Israel for '
      + 'two tumultuous years after his father’s death. His '
      + 'assassination (',
      { xt: { text: '2 Sam 4', usfm: '2SA.004' } },
      ') triggered Israel’s appeal to David.'
    ],
  },
  { version: 'AMP', usfm: '1CH.1.6', type: 'note.f',
    texts: [ 'In Gen 10:3', { it: 'Riphath' }, '.' ],
    expect: [
      'In ',
      { xt: { text: 'Gen 10:3', usfm: 'GEN.010.003' } },
      { it: 'Riphath' },
      '.'
    ],
  },
  { version: 'AMP', usfm: '1CH.6.16', type: 'note.f',
    texts: [ 'In Hebrew this is the first verse in ch 6.' ],
    expect: [
      'In Hebrew this is the first verse in ',
      { xt: { text: 'ch 6', usfm: '1CH.006' } },
      '.'
    ],
  },
  { version: 'AMP', usfm: 'GEN.32.24', type: 'note.f',
    texts: [
      'This was God Himself (as Jacob eventually realizes in '
       + 'Gen 32:30; see also v 29 and Hosea 12:4), '
       + 'in the form of an angel.',
    ],
    expect: [
      'This was God Himself (as Jacob eventually realizes in ',
      { xt: { text: 'Gen 32:30', usfm: 'GEN.032.030' } },
      '; see also ',
      { xt: { text: 'v 29', usfm: 'GEN.032.029' } },
      ' and ',
      { xt: { text: 'Hosea 12:4', usfm: 'HOS.012.004' } },
      '), in the form of an angel.'
    ],
  },
  { version: 'AMP', usfm: 'GEN.36.12', type: 'note.f',
    texts: [ 'See note 22:24.' ],
    expect: [
      'See note ',
      { xt: { text: '22:24', usfm: 'GEN.022.024' } },
      '.'
    ],
  },
  { version: 'AMP', usfm: 'GEN.36.39', type: 'note.f',
    texts: [ 'In 1 Chr 1:50, Hadad.' ],
    expect: [
      'In ',
      { xt: { text: '1 Chr 1:50', usfm: '1CH.001.050' } },
      ',  Hadad.'
    ],
  },
  { version: 'AMP', usfm: 'GEN.37.23', type: 'note.f',
    texts: [ 'See note v 3.' ],
    expect: [
      'See note ',
      { xt: { text: 'v 3', usfm: 'GEN.037.003' } },
      '.'
    ],
  },
  { version: 'AMP', usfm: 'GEN.40.19', type: 'note.f',
    texts: [
      'Notice the totally different usage of the words '
      + '“lift up your head.” In v 13, it is used idiomatically '
      + 'as “present you in public,” but in v 19, it is used literally, '
      + '“lift your head up off of your body.”'
    ],
    expect: [
      'Notice the totally different usage of the words “lift up your head.” In ',
      { xt: { text: 'v 13', usfm: 'GEN.040.013' } },
      ',  it is used idiomatically as “present you in public,” but in ',
      { xt: { text: 'v 19', usfm: 'GEN.040.019' } },
      ',  it is used literally, “lift your head up off of your body.”'
    ],
  },
  { version: 'AMP', usfm: 'GEN.42.7', type: 'note.f',
    texts: [
      'Joseph was conversing with his brothers through an interpreter '
      + '(v 23).'
    ],
    expect: [
      'Joseph was conversing with his brothers through an interpreter (',
      { xt: { text: 'v 23', usfm: 'GEN.042.023' } },
      ').'
    ],
  },
  { version: 'AMP', usfm: 'HAG.1.2', type: 'note.f',
    texts: [
      'The people of Judah had completed seventy years of captivity in '
      + 'Babylon (Jer 25:11, 12; Dan 9:2). In October 539',
      { sc: 'b' },
      '.',
      { sc: 'c' },
      '., the Medes and Persians conquered Babylon, whereupon Cyrus the '
      + 'Great (founder of the Persian Empire, his reign extended from '
      + '559-529',
      { sc: 'b' },
      '.',
      { sc: 'c' },
      '.) issued a decree permitting the Jews to return home and mandating '
      + 'the rebuilding of the temple (Ezra 1:1-4). Some 50,000 returned '
      + '(Ezra 2:64, 65) and shortly thereafter laid the foundation of the '
      + 'temple (Ezra 3:8-10), but when neighboring Samaritans antagonized '
      + 'the Jews, work on the temple stopped and the temple work lay '
      + 'dormant for some sixteen years. It was during the reign of Darius '
      + 'the Great that Haggai and Zechariah rebuked the people and '
      + 'admonished them to complete the temple. The people responded and '
      + 'the temple was completed in 516',
      { sc: 'b' },
      '.',
      { sc: 'c' },
      '.'
    ],
    expect: [
      'The people of Judah had completed seventy years of captivity in Babylon (',
      { xt: { text: 'Jer 25:11, 12', usfm: 'JER.025.011,012' } },
      '; ',
      { xt: { text: 'Dan 9:2', usfm: 'DAN.009.002' } },
      '). In October 539',
      { sc: 'b' },
      '.',
      { sc: 'c' },
      '., the Medes and Persians conquered Babylon, whereupon Cyrus the Great (founder of the Persian Empire, his reign extended from 559-529',
      { sc: 'b' },
      '.',
      { sc: 'c' },
      '.) issued a decree permitting the Jews to return home and mandating the rebuilding of the temple (',
      { xt: { text: 'Ezra 1:1-4', usfm: 'EZR.001.001-004' } },
      '). Some 50,000 returned (',
      { xt: { text: 'Ezra 2:64, 65', usfm: 'EZR.002.064,065' } },
      ') and shortly thereafter laid the foundation of the temple (',
      { xt: { text: 'Ezra 3:8-10', usfm: 'EZR.003.008-010' } },
      '), but when neighboring Samaritans antagonized the Jews, work on the temple stopped and the temple work lay dormant for some sixteen years. It was during the reign of Darius the Great that Haggai and Zechariah rebuked the people and admonished them to complete the temple. The people responded and the temple was completed in 516',
      { sc: 'b' },
      '.',
      { sc: 'c' },
      '.'
    ],
  },
  /*************************************************************************/
  { version: 'CEV', usfm: '2CH.34.20', type: 'note.f',
    texts: [ 'Also called “Achbor son of Micaiah” (see 2 Kings 22.12).' ],
    expect: [
      'Also called “Achbor son of Micaiah” (see ',
      { xt: { text: '2 Kings 22.12', usfm: '2KI.022.012' } },
      ').'
    ],
  },
  { version: 'CEV', usfm: '2CH.34.30', type: 'note.f',
    texts: [
      "The Hebrew text has “The Book of God's Agreement,” which is the "
      + "same as “The Book of God's Law” in verses 15 and 19. In "
      + "traditional translations this is called “The Book of the Covenant.”"
    ],
    expect: [
      "The Hebrew text has “The Book of God's Agreement,” which is the same as “The Book of God's Law” in verses ",
      { xt: { text: '15', usfm: '2CH.034.015' } },
      ' and ',
      { xt: { text: '19', usfm: '2CH.034.019' } },
      '. In traditional translations this is called “The Book of the Covenant.”'
    ],
  },
  { version: 'CEV', usfm: '2CH.35.1', type: 'note.f',
    texts: [ 'See the note at 29.3.' ],
    expect: [
      'See the note at ',
      { xt: { text: '29.3', usfm: '2CH.029.003' } },
      '.'
    ],
  },
  /*************************************************************************/
  { version: 'HCSB', usfm: 'HOS.4.18', type: 'note.f',
    texts: [ 'Lit Her shields ; Ps 47:9; 89:18' ],
    expect: [
      'Lit Her shields ; ',
      { xt: { text: 'Ps 47:9', usfm: 'PSA.047.009' } },
      '; ',
      { xt: { text: '89:18', usfm: 'PSA.089.018' } }
    ],
  },
  { version: 'HCSB', usfm: 'HOS.11.12', type: 'note.f',
    texts: [ 'Hs 12:1 in Hb' ],
    expect: [
      { xt: { text: 'Hs 12:1', usfm: 'HOS.012.001' } },
      ' in Hb'
    ],
  },
  /*************************************************************************/
  { version: 'NASB1995', usfm: '1KI.4.26', type: 'note.f',
    texts: [ 'One ms reads', { it: '4000,' }, 'cf 2 Chr 9:25' ],
    expect: [
      'One ms reads',
      { it: '4000,' },
      'cf ',
      { xt: { text: '2 Chr 9:25', usfm: '2CH.009.025' } }
    ],
  },
  /*************************************************************************/
  { version: 'NIV11', usfm: 'GEN.2.5', type: 'note.f',
    texts: [
      '; also in verse 6',
    ],
    expect: [
      '; also in ',
      { xt: { text: 'verse 6', usfm: 'GEN.002.006' } }
    ],
  },
  { version: 'NIV11', usfm: '1CH.1.6', type: 'note.f',
    texts: [
      'Many Hebrew manuscripts and Vulgate '
      + '(see also Septuagint and Gen. 10:3); most Hebrew manuscripts'
    ],
    expect: [
      'Many Hebrew manuscripts and Vulgate (see also Septuagint and ',
      { xt: { text: 'Gen. 10:3', usfm: 'GEN.010.003' } },
      '); most Hebrew manuscripts'
    ],
  },
  { version: 'NIV11', usfm: '1CH.1.17', type: 'note.f',
    texts: [
      'One Hebrew manuscript and some Septuagint manuscripts '
      + '(see also Gen. 10:23); most Hebrew manuscripts do not have this '
      + 'line.'
    ],
    expect: [
      'One Hebrew manuscript and some Septuagint manuscripts (see also ',
      { xt: { text: 'Gen. 10:23', usfm: 'GEN.010.023' } },
      '); most Hebrew manuscripts do not have this line.'
    ],
  },
  { version: 'NIV11', usfm: '1CH.1.42', type: 'note.f',
    texts: [ 'See Gen. 36:28; Hebrew' ],
    expect: [
      'See ',
      { xt: { text: 'Gen. 36:28', usfm: 'GEN.036.028' } },
      '; Hebrew'
    ],
  },
  { version: 'NIV11', usfm: '1CH.3.6', type: 'note.f',
    texts: [
      'Two Hebrew manuscripts (see also 2 Samuel 5:15 and 1 Chron. 14:5); '
      + 'most Hebrew manuscripts'
    ],
    expect: [
      'Two Hebrew manuscripts (see also ',
      { xt: { text: '2 Samuel 5:15', usfm: '2SA.005.015' } },
      ' and ',
      { xt: { text: '1 Chron. 14:5', usfm: '1CH.014.005' } },
      '); most Hebrew manuscripts'
    ],
  },
  { version: 'NIV11', usfm: '1CH.6.77', type: 'note.f',
    texts: [ 'See Septuagint and Joshua 21:34; Hebrew does not have' ],
    expect: [
      'See Septuagint and ',
      { xt: { text: 'Joshua 21:34', usfm: 'JOS.021.034' } },
      '; Hebrew does not have'
    ],
  },
  { version: 'NIV11', usfm: '1CH.8.30', type: 'note.f',
    texts: [
      'Some Septuagint manuscripts (see also 9:36); Hebrew does not have'
    ],
    expect: [
      'Some Septuagint manuscripts (see also ',
      { xt: { text: '9:36', usfm: '1CH.009.036' } },
      '); Hebrew does not have'
    ],
  },
  { version: 'NIV11', usfm: 'EZR.7.26', type: 'note.f',
    texts: [ 'The text of 7:12-26 is in Aramaic.' ],
    expect: [
      'The text of ',
      { xt: { text: '7:12-26', usfm: 'EZR.007.012-026' } },
      ' is in Aramaic.'
    ],
  },
  { version: 'NIV11', usfm: 'EZR.8.10', type: 'note.f',
    texts: [
      'Some Septuagint manuscripts (also 1 Esdras 8:36); Hebrew does not have'
    ],
    /* :XXX: IF we allow references to books with no chapter/verse counts,
     *       this would parse to:
     *        [
     *          'Some Septuagint manuscripts (also ',
     *          { xt: { text: '1 Esdras 8:36', usfm: '1ES.008.036' } },
     *          '); Hebrew does not have'
     *        ],
     */
    expect: [
      'Some Septuagint manuscripts (also 1 Esdras 8:36); Hebrew does not have'
    ],
  },
  { version: 'NIV11', usfm: 'GAL.3.8', type: 'note.f',
    texts: [ 'Gen. 12:3; 18:18; 22:18' ],
    expect: [
      { xt: { text: 'Gen. 12:3', usfm: 'GEN.012.003' } },
      '; ',
      { xt: { text: '18:18', usfm: 'GEN.018.018' } },
      '; ',
      { xt: { text: '22:18', usfm: 'GEN.022.018' } }
    ],
  },
  { version: 'NIV11', usfm: 'HEB.1.12', type: 'note.f',
    texts: [ 'Psalm 102:25-27' ],
    expect: [
      { xt: { text: 'Psalm 102:25-27', usfm: 'PSA.102.025-027' } }
    ],
  },
  { version: 'NIV11', usfm: 'HEB.3.15', type: 'note.f',
    texts: [ 'Psalm 95:7,8' ],
    expect: [
      { xt: { text: 'Psalm 95:7,8', usfm: 'PSA.095.007,008' } }
    ],
  },
  { version: 'NIV11', usfm: 'HEB.4.3', type: 'note.f',
    texts: [ 'Psalm 95:11; also in verse 5' ],
    expect: [
      { xt: { text: 'Psalm 95:11', usfm: 'PSA.095.011' } },
      '; also in ',
      { xt: { text: 'verse 5', usfm: 'HEB.004.005' } }
    ],
  },
  { version: 'NIV11', usfm: 'HEB.10.30', type: 'note.f',
    texts: [ 'Deut. 32:36; Psalm 135:14' ],
    expect: [
      { xt: { text: 'Deut. 32:36', usfm: 'DEU.032.036' } },
      '; ',
      { xt: { text: 'Psalm 135:14', usfm: 'PSA.135.014' } }
    ],
  },
  { version: 'NIV11', usfm: 'HEB.12.21', type: 'note.f',
    texts: [ 'See Deut. 9:19.' ],
    expect: [
      'See ',
      { xt: { text: 'Deut. 9:19', usfm: 'DEU.009.019' } },
      '.'
    ],
  },
  /* note.f }
   *************************************************************************
   * note.x {
   */
  { version: 'CEV', usfm: '1CH.2.7', type: 'note.x',
    texts: [ 'Js 7.1.' ],
    expect: [
      { xt: { text: 'Js 7.1', usfm: 'JOS.007.001' } },
      '.'
    ],
  },
  { version: 'CEV', usfm: '1CH.5.1', type: 'note.x',
    texts: [ 'Gn 35.22; 49.3,4.' ],
    expect: [
      { xt: { text: 'Gn 35.22', usfm: 'GEN.035.022' } },
      '; ',
      { xt: { text: '49.3,4', usfm: 'GEN.049.003,004' } },
      '.'
    ],
  },
  { version: 'CEV', usfm: '1CH.3.5', type: 'note.x',
    texts: [ '2 S 11.2-4.' ],
    expect: [
      { xt: { text: '2 S 11.2-4', usfm: '2SA.011.002-004' } },
      '.'
    ],
  },
  { version: 'CEV', usfm: '2CH.34.5', type: 'note.x',
    texts: [ '1 K 13.2.' ],
    expect: [
      { xt: { text: '1 K 13.2', usfm: '1KI.013.002' } },
      '.'
    ],
  },
  { version: 'CEV', usfm: '2CH.35.4', type: 'note.x',
    texts: [ '2 Ch 8.14.' ],
    expect: [
      { xt: { text: '2 Ch 8.14', usfm: '2CH.008.014' } },
      '.'
    ],
  },
  /* note.x }
   *************************************************************************
   * Currently failing {
   *
   */
  { version: 'NIV11', usfm: 'GEN.6.15', type: 'note.f',
    texts: [
      'That is, about 450 feet long, 75 feet wide and 45 feet high or '
      + 'about 135 meters long, 23 meters wide and 14 meters high',
    ],
    expect: [
      'That is, about 450 feet long, 75 feet wide and 45 feet high or '
      + 'about 135 meters long, 23 meters wide and 14 meters high',
    ],
    actual: [
      'That is, about 450 feet long, 75 feet wide and 45 feet high or '
      + 'about 135 meters long, 23 meters wide and ',
      { xt: { text: '14', usfm: 'GEN.006.014' } },
      ' meters high'
    ],
  },
  { version: 'NIV11', usfm: 'GEN.6.16', type: 'note.f',
    texts: [
      'That is, about 18 inches or about 45 centimeters'
    ],
    expect: [
      'That is, about 18 inches or about 45 centimeters'
    ],
    actual: [
      'That is, about ',
      { xt: { text: '18', usfm: 'GEN.006.018' } },
      ' inches or about 45 centimeters'
    ],
  },
  { version: 'NIV11', usfm: 'GEN.7.20', type: 'note.f',
    texts: [
      'That is, about 23 feet or about 6.8 meters',
    ],
    expect: [
      'That is, about 23 feet or about 6.8 meters',
    ],
    actual: [
      'That is, about ',
      { xt: { text: '23', usfm: 'GEN.007.023' } },
      ' feet or about ',
      { xt: { text: '6.8', usfm: 'GEN.006.008' } },
      ' meters'
    ],
  },
  { version: 'NIV11', usfm: 'GEN.18.6', type: 'note.f',
    texts: [
      'That is, probably about 36 pounds or about 16 kilograms'
    ],
    expect: [
      'That is, probably about 36 pounds or about 16 kilograms'
    ],
    actual: [
      'That is, probably about 36 pounds or about ',
      { xt: { text: '16', usfm: 'GEN.018.016' } },
      ' kilograms'
    ],
  },
  // BSB
  { version: 'BSB', usfm: 'GEN.6.15', type: 'note.f',
    texts: [
      'The ark was approximately 450 feet long, 75 feet wide, '
      + 'and 45 feet high (137.2 meters long, 22.9 meters wide, and '
      + '13.7 meters high).'
    ],
    expect: [
      'The ark was approximately 450 feet long, 75 feet wide, '
      + 'and 45 feet high (137.2 meters long, 22.9 meters wide, and '
      + '13.7 meters high).'
    ],
    actual: [
      'The ark was approximately 450 feet long, 75 feet wide, '
      + 'and 45 feet high (137.2 meters long, ',
      { xt: { text: '22.9', usfm: 'GEN.022.009' } },
      ' meters wide, and ',
      { xt: { text: '13.7', usfm: 'GEN.013.007' } },
      ' meters high).'
    ],
  },
  { version: 'BSB', usfm: 'GEN.6.16', type: 'note.f',
    texts: [
      'A cubit is approximately 18 inches or 45.7 centimeters.'
    ],
    expect: [
      'A cubit is approximately 18 inches or 45.7 centimeters.'
    ],
    actual: [
      'A cubit is approximately ',
      { xt: { text: '18', usfm: 'GEN.006.018' } },
      ' inches or ',
      { xt: { text: '45.7', usfm: 'GEN.045.007' } },
      ' centimeters.'
    ],
  },
  { version: 'BSB', usfm: 'GEN.7.20', type: 'note.f',
    texts: [
      '15 cubits is approximately 22.5 feet or 6.9 meters.',
    ],
    expect: [
      '15 cubits is approximately 22.5 feet or 6.9 meters.',
    ],
    actual: [
      { xt: { text: '15', usfm: 'GEN.007.015' } },
      ' cubits is approximately ',
      { xt: { text: '22.5', usfm: 'GEN.022.005' } },
      ' feet or ',
      { xt: { text: '6.9', usfm: 'GEN.006.009' } },
      ' meters.'
    ],
  },
  { version: 'BSB', usfm: 'GEN.18.6', type: 'note.f',
    texts: [
      '3 seahs is approximately 19.8 dry quarts or 21.9 liters (probably '
      + 'about 24.5 pounds or 11.1 kilograms of flour).'
    ],
    expect: [
      '3 seahs is approximately 19.8 dry quarts or 21.9 liters (probably '
      + 'about 24.5 pounds or 11.1 kilograms of flour).'
    ],
    actual: [
      { xt: { text: '3', usfm: 'GEN.018.003' } },
      ' seahs is approximately ',
      { xt: { text: '19.8', usfm: 'GEN.019.008' } },
      ' dry quarts or ',
      { xt: { text: '21.9', usfm: 'GEN.021.009' } },
      ' liters (probably about ',
      { xt: { text: '24.5', usfm: 'GEN.024.005' } },
      ' pounds or ',
      { xt: { text: '11.1', usfm: 'GEN.011.001' } },
      ' kilograms of flour).'
    ],
  },
  /* Currently failing }
   *************************************************************************/
];

module.exports = tests;
