const tests  = [
  /*************************************************************************
   * note.f {
   *
   * AMP {
   */
  { version: 'AMP', usfm: 'GEN.32.24', type: 'note.f',
    texts: [
      'This was God Himself (as Jacob eventually realizes in '
       + 'Gen 32:30; see also v 29 and Hosea 12:4), '
       + 'in the form of an angel.',
    ],
    expect: [
      'This was God Himself (as Jacob eventually realizes in ',
      { xt: { text: 'Gen 32:30', usfm: 'GEN.32.30' } },
      '; see also v 29 and ',
      { xt: { text: 'Hosea 12:4', usfm: 'HOS.12.4' } },
      '), in the form of an angel.'
    ],
  },
  { version: 'AMP', usfm: 'GEN.36.12', type: 'note.f',
    texts: [ 'See note 22:24.' ],
    expect: [
      'See note ',
      { xt: { text: '22:24', usfm: 'GEN.22.24' } },
      '.'
    ],
  },
  { version: 'AMP', usfm: 'GEN.36.39', type: 'note.f',
    texts: [ 'In 1 Chr 1:50, Hadad.' ],
    expect: [
      'In ',
      { xt: { text: '1 Chr 1:50', usfm: '1CH.1.50' } },
      ', Hadad.'
    ],
  },
  { version: 'AMP', usfm: 'LEV.18.7', type: 'note.f',
    texts: [
      '). Otherwise, the literal meaning would refer to intimate relations with the father himself, including homosexuality. The text itself states that this is not the meaning, especially in 20:11a (',
    ],
    expect: [
      '). Otherwise, the literal meaning would refer to intimate relations with the father himself, including homosexuality. The text itself states that this is not the meaning, especially in ',
      { xt: { text: '20:11', usfm: 'LEV.20.11' } },
      'a (',
    ],
  },
  { version: 'AMP', usfm: '1CH.1.6', type: 'note.f',
    texts: [ 'In Gen 10:3', { it: 'Riphath' }, '.' ],
    expect: [
      'In ',
      { xt: { text: 'Gen 10:3', usfm: 'GEN.10.3' } },
      { it: 'Riphath' },
      '.'
    ],
  },
  { version: 'AMP', usfm: '1CH.6.16', type: 'note.f (chapter)',
    texts: [ 'In Hebrew this is the first verse in ch 6.' ],
    expect: [
      'In Hebrew this is the first verse in ',
      { xt: { text: 'ch 6', usfm: '1CH.6' } },
      '.'
    ],
  },
  { version: 'AMP', usfm: '1CH.11.1', type: 'note.f',
    texts: [
      'Saul’s son, Ish-bosheth, ruled over the tribes of Israel for '
      + 'two tumultuous years after his father’s death. His '
      + 'assassination (2 Sam 4) triggered Israel’s appeal to David.'
    ],
    expect: [
      'Saul’s son, Ish-bosheth, ruled over the tribes of Israel for '
      + 'two tumultuous years after his father’s death. His '
      + 'assassination (',
      { xt: { text: '2 Sam 4', usfm: '2SA.4' } },
      ') triggered Israel’s appeal to David.'
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
      { xt: { text: 'Jer 25:11, 12', usfm: 'JER.25.11,12' } },
      '; ',
      { xt: { text: 'Dan 9:2', usfm: 'DAN.9.2' } },
      '). In October 539',
      { sc: 'b' },
      '.',
      { sc: 'c' },
      '., the Medes and Persians conquered Babylon, whereupon Cyrus the Great (founder of the Persian Empire, his reign extended from 559-529',
      { sc: 'b' },
      '.',
      { sc: 'c' },
      '.) issued a decree permitting the Jews to return home and mandating the rebuilding of the temple (',
      { xt: { text: 'Ezra 1:1-4', usfm: 'EZR.1.1-4' } },
      '). Some 50,000 returned (',
      { xt: { text: 'Ezra 2:64, 65', usfm: 'EZR.2.64,65' } },
      ') and shortly thereafter laid the foundation of the temple (',
      { xt: { text: 'Ezra 3:8-10', usfm: 'EZR.3.8-10' } },
      '), but when neighboring Samaritans antagonized the Jews, work on the temple stopped and the temple work lay dormant for some sixteen years. It was during the reign of Darius the Great that Haggai and Zechariah rebuked the people and admonished them to complete the temple. The people responded and the temple was completed in 516',
      { sc: 'b' },
      '.',
      { sc: 'c' },
      '.'
    ],
  },
  { version: 'AMP', usfm: 'ZEP.2.7', type: 'note.f',
    texts: [
      'This is one of the more than twenty-five details of Bible prophecy about the promised land that has been literally fulfilled. See note Ezek 26:14 for information about a similar fulfillment of Bible prophecy with regard to Tyre.',
    ],
    expect: [
      'This is one of the more than twenty-five details of Bible prophecy about the promised land that has been literally fulfilled. See note ',
      { xt: { text: 'Ezek 26:14', usfm: 'EZK.26.14' } },
      ' for information about a similar fulfillment of Bible prophecy with regard to Tyre.',
    ],
  },
  { version: 'AMP', usfm: 'MAT.26.39', type: 'note.f (see)',
    texts: [
      '). Others think that the request related to the time of separation from the Father, which He would have to endure in death (see 27:46). However, the sense of ',
    ],
    expect: [
      '). Others think that the request related to the time of separation from the Father, which He would have to endure in death (see ',
      { xt: { text: '27:46', usfm: 'MAT.27.46' } },
      '). However, the sense of ',
    ],
  },
  { version: 'AMP', usfm: 'MRK.2.10', type: 'note.f',
    texts: [
      '). It appears over eighty times in the Gospels. Especially notable is its use in 8:31.',
    ],
    expect: [
      '). It appears over eighty times in the Gospels. Especially notable is its use in ',
      { xt: { text: '8:31', usfm: 'MRK.8.31' } },
      '.'
    ],
  },
  { version: 'AMP', usfm: 'ROM.13.2', type: 'note.f',
    texts: [
      'An exception to this is recorded in Acts 5:27-29. '
      + 'See especially v 29.',
    ],
    expect: [
      'An exception to this is recorded in ',
      { 'xt': { 'text': 'Acts 5:27-29', 'usfm': 'ACT.5.27-29' } },
      '. See especially v 29.',
    ],
  },
  { version: 'AMP', usfm: 'REV.12.3', type: 'note.f (cf)',
    texts: [
      ' ff as well. Daniel’s description reveals that the ten horns are ten kings who temporarily reign with the Antichrist during the Great Tribulation (cf 17:12).',
    ],
    expect: [
      ' ff as well. Daniel’s description reveals that the ten horns are ten kings who temporarily reign with the Antichrist during the Great Tribulation (cf ',
      { xt: { text: '17:12', usfm: 'REV.17.12' } },
      ').',
    ],
  },
  /* AMP }
   *************************************************************************
   * CEV {
   */
  { version: 'CEV', usfm: 'JOS.15.7', type: 'note.f',
    texts: [ 'Not the same town as in 10.38,39.' ],
    expect: [
      'Not the same town as in ',
      { xt: { text: '10.38,39', usfm: 'JOS.10.38,39' } },
      '.'
    ],
  },
  { version: 'CEV', usfm: '1CH.12.1', type: 'note.f (chapter)',
    texts: [
      'Ziklag was the Philistine town that King Achish of Gath gave David '
      + 'in return for his loyalty (see 1 Samuel 27.6). This happened during '
      + 'the time that David was living as an outlaw, so the events in this '
      + 'chapter actually took place before chapter 11 '
      + 'when David became king of Israel.'
    ],
    expect: [
      'Ziklag was the Philistine town that King Achish of Gath gave David in return for his loyalty (see ',
      { xt: { text: '1 Samuel 27.6', usfm: '1SA.27.6' } },
      '). This happened during the time that David was living as an outlaw, so the events in this chapter actually took place before ',
      { xt: { text: "chapter 11", usfm: "1CH.11" } },
      ' when David became king of Israel.'
    ],
  },
  { version: 'CEV', usfm: '2CH.34.20', type: 'note.f',
    texts: [ 'Also called “Achbor son of Micaiah” (see 2 Kings 22.12).' ],
    expect: [
      'Also called “Achbor son of Micaiah” (see ',
      { xt: { text: '2 Kings 22.12', usfm: '2KI.22.12' } },
      ').'
    ],
  },
  { version: 'CEV', usfm: '2CH.35.1', type: 'note.f',
    texts: [ 'See the note at 29.3.' ],
    expect: [
      'See the note at ',
      { xt: { text: '29.3', usfm: '2CH.29.3' } },
      '.'
    ],
  },
  /* CEV }
   *************************************************************************
   * HCSB {
   */
  { version: 'HCSB', usfm: 'HOS.4.18', type: 'note.f',
    texts: [ 'Lit Her shields ; Ps 47:9; 89:18' ],
    expect: [
      'Lit Her shields ; ',
      { xt: { text: 'Ps 47:9', usfm: 'PSA.47.9' } },
      '; ',
      { xt: { text: '89:18', usfm: 'PSA.89.18' } }
    ],
  },
  { version: 'HCSB', usfm: 'HOS.11.12', type: 'note.f',
    texts: [ 'Hs 12:1 in Hb' ],
    expect: [
      { xt: { text: 'Hs 12:1', usfm: 'HOS.12.1' } },
      ' in Hb'
    ],
  },
  { version: 'HCSB', usfm: 'ROM.1.1', type: 'note.f',
    texts: [ '1Co 1:1; 9:1; 2Co 1:1' ],
    expect: [
      { xt: { text: '1Co 1:1', usfm: '1CO.1.1' } },
      '; ',
      { xt: { text: '9:1', usfm: '1CO.9.1' } },
      '; ',
      { xt: { text: '2Co 1:1', usfm: '2CO.1.1' } },
    ],
  },
  { version: 'HCSB', usfm: 'ROM.1.1', type: 'note.f',
    texts: [ 'Ac 9:15; 13:2; Gl 1:15' ],
    expect: [
      { xt: { text: 'Ac 9:15', usfm: 'ACT.9.15' } },
      '; ',
      { xt: { text: '13:2', usfm: 'ACT.13.2' } },
      '; ',
      { xt: { text: 'Gl 1:15', usfm: 'GAL.1.15' } },
    ],
  },
  /* HCSB }
   *************************************************************************
   * NASB1995 {
   */
  { version: 'NASB1995', usfm: '1KI.4.26', type: 'note.f',
    texts: [ 'One ms reads', { it: '4000,' }, 'cf 2 Chr 9:25' ],
    expect: [
      'One ms reads',
      { it: '4000,' },
      'cf ',
      { xt: { text: '2 Chr 9:25', usfm: '2CH.9.25' } }
    ],
  },
  /* NASB1995 }
   *************************************************************************
   * NIV11 {
   */
  { version: 'NIV11', usfm: '1CH.1.6', type: 'note.f',
    texts: [
      'Many Hebrew manuscripts and Vulgate '
      + '(see also Septuagint and Gen. 10:3); most Hebrew manuscripts'
    ],
    expect: [
      'Many Hebrew manuscripts and Vulgate (see also Septuagint and ',
      { xt: { text: 'Gen. 10:3', usfm: 'GEN.10.3' } },
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
      { xt: { text: 'Gen. 10:23', usfm: 'GEN.10.23' } },
      '); most Hebrew manuscripts do not have this line.'
    ],
  },
  { version: 'NIV11', usfm: '1CH.1.42', type: 'note.f',
    texts: [ 'See Gen. 36:28; Hebrew' ],
    expect: [
      'See ',
      { xt: { text: 'Gen. 36:28', usfm: 'GEN.36.28' } },
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
      { xt: { text: '2 Samuel 5:15', usfm: '2SA.5.15' } },
      ' and ',
      { xt: { text: '1 Chron. 14:5', usfm: '1CH.14.5' } },
      '); most Hebrew manuscripts'
    ],
  },
  { version: 'NIV11', usfm: '1CH.6.77', type: 'note.f',
    texts: [ 'See Septuagint and Joshua 21:34; Hebrew does not have' ],
    expect: [
      'See Septuagint and ',
      { xt: { text: 'Joshua 21:34', usfm: 'JOS.21.34' } },
      '; Hebrew does not have'
    ],
  },
  { version: 'NIV11', usfm: '1CH.8.30', type: 'note.f',
    texts: [
      'Some Septuagint manuscripts (see also 9:36); Hebrew does not have'
    ],
    expect: [
      'Some Septuagint manuscripts (see also ',
      { xt: { text: '9:36', usfm: '1CH.9.36' } },
      '); Hebrew does not have'
    ],
  },
  { version: 'NIV11', usfm: 'EZR.7.26', type: 'note.f',
    texts: [ 'The text of 7:12-26 is in Aramaic.' ],
    expect: [
      'The text of ',
      { xt: { text: '7:12-26', usfm: 'EZR.7.12-26' } },
      ' is in Aramaic.'
    ],
  },
  { version: 'NIV11', usfm: 'EZR.8.10', type: 'note.f',
    texts: [
      'Some Septuagint manuscripts (also 1 Esdras 8:36); Hebrew does not have'
    ],
    /* :XXX: IF we allow references to books with no chapter/verse counts,
     *       this would parse to:
     */
    expect: [
      'Some Septuagint manuscripts (also ',
      { xt: { text: '1 Esdras 8:36', usfm: '1ES.8.36' } },
      '); Hebrew does not have'
    ],
  },
  { version: 'NIV11', usfm: 'GEN.6.15', type: 'note.f',
    texts: [
      'That is, about 450 feet long, 75 feet wide and 45 feet high or '
      + 'about 135 meters long, 23 meters wide and 14 meters high',
    ],
    expect: [
      'That is, about 450 feet long, 75 feet wide and 45 feet high or '
      + 'about 135 meters long, 23 meters wide and 14 meters high',
    ],
  },
  { version: 'NIV11', usfm: 'GEN.6.16', type: 'note.f',
    texts: [
      'That is, about 18 inches or about 45 centimeters'
    ],
    expect: [
      'That is, about 18 inches or about 45 centimeters'
    ],
  },
  { version: 'NIV11', usfm: 'GEN.7.20', type: 'note.f',
    texts: [
      'That is, about 23 feet or about 6.8 meters',
    ],
    expect: [
      'That is, about 23 feet or about 6.8 meters',
    ],
  },
  { version: 'NIV11', usfm: 'GEN.18.6', type: 'note.f',
    texts: [
      'That is, probably about 36 pounds or about 16 kilograms'
    ],
    expect: [
      'That is, probably about 36 pounds or about 16 kilograms'
    ],
  },
  { version: 'NIV11', usfm: 'GAL.3.8', type: 'note.f',
    texts: [ 'Gen. 12:3; 18:18; 22:18' ],
    expect: [
      { xt: { text: 'Gen. 12:3', usfm: 'GEN.12.3' } },
      '; ',
      { xt: { text: '18:18', usfm: 'GEN.18.18' } },
      '; ',
      { xt: { text: '22:18', usfm: 'GEN.22.18' } }
    ],
  },
  { version: 'NIV11', usfm: 'HEB.1.8', type: 'note.f',
    texts: [ 'Psalm 104:4' ],
    expect: [
      { xt: { text: 'Psalm 104:4', usfm: 'PSA.104.4' } }
    ],
  },
  { version: 'NIV11', usfm: 'HEB.1.12', type: 'note.f',
    texts: [ 'Psalm 102:25-27' ],
    expect: [
      { xt: { text: 'Psalm 102:25-27', usfm: 'PSA.102.25-27' } }
    ],
  },
  { version: 'NIV11', usfm: 'HEB.3.15', type: 'note.f',
    texts: [ 'Psalm 95:7,8' ],
    expect: [
      { xt: { text: 'Psalm 95:7,8', usfm: 'PSA.95.7,8' } }
    ],
  },
  { version: 'NIV11', usfm: 'HEB.4.3', type: 'note.f',
    texts: [ 'Psalm 95:11; also in verse 5' ],
    expect: [
      { xt: { text: 'Psalm 95:11', usfm: 'PSA.95.11' } },
      '; also in verse 5',
    ],
  },
  { version: 'NIV11', usfm: 'HEB.10.30', type: 'note.f',
    texts: [ 'Deut. 32:36; Psalm 135:14' ],
    expect: [
      { xt: { text: 'Deut. 32:36', usfm: 'DEU.32.36' } },
      '; ',
      { xt: { text: 'Psalm 135:14', usfm: 'PSA.135.14' } }
    ],
  },
  { version: 'NIV11', usfm: 'HEB.12.21', type: 'note.f',
    texts: [ 'See Deut. 9:19.' ],
    expect: [
      'See ',
      { xt: { text: 'Deut. 9:19', usfm: 'DEU.9.19' } },
      '.'
    ],
  },
  /* NIV11 }
   *************************************************************************
   * BSB {
   */
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
  },
  { version: 'BSB', usfm: 'GEN.6.16', type: 'note.f',
    texts: [
      'A cubit is approximately 18 inches or 45.7 centimeters.'
    ],
    expect: [
      'A cubit is approximately 18 inches or 45.7 centimeters.'
    ],
  },
  { version: 'BSB', usfm: 'GEN.7.20', type: 'note.f',
    texts: [
      '15 cubits is approximately 22.5 feet or 6.9 meters.',
    ],
    expect: [
      '15 cubits is approximately 22.5 feet or 6.9 meters.',
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
  },
  { version: 'BSB', usfm: 'NUM.22.22', type: 'note.f (chapter)',
    texts: [
      'Or Angel; here through the rest of chapter 22; corresponding pronouns '
      + 'may also be capitalized.'
    ],
    expect: [
      'Or Angel; here through the rest of ',
      { xt: { text: 'chapter 22', usfm: 'NUM.22' } },
      '; corresponding pronouns may also be capitalized.'
    ],
  },
  { version: 'BSB', usfm: 'JDG.13.3', type: 'note.f (chapter)',
    texts: [
      'Or Angel; here and throughout chapter 13; corresponding pronouns '
      + 'may also be capitalized.'
    ],
    expect: [
      'Or Angel; here and throughout ',
      { xt: { text: 'chapter 13', usfm: 'JDG.13' } },
      '; corresponding pronouns may also be capitalized.'
    ],
  },
  { version: 'BSB', usfm: 'DAN.7.13', type: 'note.f',
    texts: [
      'See Matthew 24:30, Matthew 26:64, Mark 13:26, Mark 14:62, Luke 21:27, Revelation 1:13, and Revelation 14:14.',
    ],
    expect: [
      'See ',
      { xt: { text: 'Matthew 24:30', usfm: 'MAT.24.30' } },
      ', ',
      { xt: { text: 'Matthew 26:64', usfm: 'MAT.26.64' } },
      ', ',
      { xt: { text: 'Mark 13:26', usfm: 'MRK.13.26' } },
      ', ',
      { xt: { text: 'Mark 14:62', usfm: 'MRK.14.62' } },
      ', ',
      { xt: { text: 'Luke 21:27', usfm: 'LUK.21.27' } },
      ', ',
      { xt: { text: 'Revelation 1:13', usfm: 'REV.1.13' } },
      ', and ',
      { xt: { text: 'Revelation 14:14', usfm: 'REV.14.14' } },
      '.',
    ],
  },
  /* BSB }
   *************************************************************************
   * CSB {
   */
  { version: 'CSB', usfm: '2CO.11.26', type: 'note.x',
    texts: [
      'Ac 9:23; 13:50; 14:5; 17:5; 18:12; 20:3,19; 21:27; 23:10–12; 25:3',
    ],
    expect: [
      { xt: { text: 'Ac 9:23', usfm: 'ACT.9.23' } },
      '; ',
      { xt: { text: '13:50', usfm: 'ACT.13.50' } },
      '; ',
      { xt: { text: '14:5', usfm: 'ACT.14.5' } },
      '; ',
      { xt: { text: '17:5', usfm: 'ACT.17.5' } },
      '; ',
      { xt: { text: '18:12', usfm: 'ACT.18.12' } },
      '; ',
      { xt: { text: '20:3,19', usfm: 'ACT.20.3,19' } },
      '; ',
      { xt: { text: '21:27', usfm: 'ACT.21.27' } },
      '; ',
      { xt: { text: '23:10-12', usfm: 'ACT.23.10-12' } },
      '; ',
      { xt: { text: '25:3', usfm: 'ACT.25.3' } },
    ],
  },
  /* CSB }
   *
   * note.f }
   *************************************************************************
   * note.x {
   *
   * CEV {
   */
  { version: 'CEV', usfm: '1CH.2.7', type: 'note.x',
    texts: [ 'Js 7.1.' ],
    expect: [
      { xt: { text: 'Js 7.1', usfm: 'JOS.7.1' } },
      '.'
    ],
  },
  { version: 'CEV', usfm: '1CH.5.1', type: 'note.x',
    texts: [ 'Gn 35.22; 49.3,4.' ],
    expect: [
      { xt: { text: 'Gn 35.22', usfm: 'GEN.35.22' } },
      '; ',
      { xt: { text: '49.3,4', usfm: 'GEN.49.3,4' } },
      '.'
    ],
  },
  { version: 'CEV', usfm: '1CH.3.5', type: 'note.x',
    texts: [ '2 S 11.2-4.' ],
    expect: [
      { xt: { text: '2 S 11.2-4', usfm: '2SA.11.2-4' } },
      '.'
    ],
  },
  { version: 'CEV', usfm: '2CH.34.5', type: 'note.x',
    texts: [ '1 K 13.2.' ],
    expect: [
      { xt: { text: '1 K 13.2', usfm: '1KI.13.2' } },
      '.'
    ],
  },
  { version: 'CEV', usfm: '2CH.35.4', type: 'note.x',
    texts: [ '2 Ch 8.14.' ],
    expect: [
      { xt: { text: '2 Ch 8.14', usfm: '2CH.8.14' } },
      '.'
    ],
  },
  /* CEV }
   *************************************************************************
   * CSB {
   */
  { version: 'CSB', usfm: 'MIC.2.7', type: 'note.x',
    texts: [ 'Ps 119:65,68,116; Jr 15:16' ],
    expect: [
      { xt: { text: 'Ps 119:65,68,116', usfm: 'PSA.119.65,68,116' } },
      '; ',
      { xt: { text: 'Jr 15:16', usfm: 'JER.15.16' } },
    ],
  },
  /* CSB }
   *************************************************************************
   * ESV {
   */
  { version: 'ESV', usfm: 'ROM.8.2', type: 'note.x',
    texts: [ '1 Cor. 15:45; 2 Cor. 3:6' ],
    expect: [
      { xt: { text: '1 Cor. 15:45', usfm: '1CO.15.45' } },
      '; ',
      { xt: { text: '2 Cor. 3:6', usfm: '2CO.3.6' } },
    ],
  },
  { version: 'ESV', usfm: 'ROM.8.2', type: 'note.x',
    texts: [ 'ver. 12; See ch. 6:14, 18; 7:4' ],
    expect: [
      'ver. 12; See ',
      { xt: { text: 'ch. 6:14, 18', usfm: 'ROM.6.14,18' } },
      '; ',
      { xt: { text: '7:4', usfm: 'ROM.7.4' } },
    ],
    /*
    actual: [
      'ver. 12; See ',
      {
        xt: {
          text: 'ch. 6',
          usfm: 'ROM.6'
        }
      },
      ':14, 18; 7:4'
    ]
    // */
  },
  { version: 'ESV', usfm: 'ROM.8.4', type: 'note.x',
    texts: [ 'ch. 1:32; 2:26' ],
    expect: [
      { xt: { text: 'ch. 1:32', usfm: 'ROM.1.32' } },
      '; ',
      { xt: { text: '2:26', usfm: 'ROM.2.26' } },
    ],
  },
  { version: 'ESV', usfm: 'ROM.8.6', type: 'note.x',
    texts: [ 'ver. 13; [Col. 2:18]; See ch. 6:21' ],
    expect: [
      'ver. 13; [',
      { xt: { text: 'Col. 2:18', usfm: 'COL.2.18' } },
      ']; See ',
      { xt: { text: 'ch. 6:21', usfm: 'ROM.6.21' } },
    ],
  },
  { version: 'ESV', usfm: 'ROM.8.9', type: 'note.x',
    texts: [ 'ver. 11; 1 Cor. 3:16; 6:19; 2 Cor. 6:16; 2 Tim. 1:14' ],
    expect: [
      'ver. 11; ',
      { xt: { text: '1 Cor. 3:16', usfm: '1CO.3.16' } },
      '; ',
      { xt: { text: '6:19', usfm: '1CO.6.19' } },
      '; ',
      { xt: { text: '2 Cor. 6:16', usfm: '2CO.6.16' } },
      '; ',
      { xt: { text: '2 Tim. 1:14', usfm: '2TI.1.14' } },
    ],
  },
  /* ESV }
   *
   * note.x }
   *************************************************************************
   * :TODO: Improperly parses {
   *
   * AMP {
   */
  { version: 'AMP', usfm: 'GEN.37.23', type: 'note.f (verse)',
    texts: [ 'See note v 3.' ],
    expect: [
      'See note ',
      { xt: { text: 'v 3', usfm: 'GEN.37.3' } },
      '.'
    ],
    actual: [ 'See note v 3.' ],
  },
  { version: 'AMP', usfm: 'GEN.40.19', type: 'note.f (verse)',
    texts: [
      'Notice the totally different usage of the words '
      + '“lift up your head.” In v 13, it is used idiomatically '
      + 'as “present you in public,” but in v 19, it is used literally, '
      + '“lift your head up off of your body.”'
    ],
    expect: [
      'Notice the totally different usage of the words “lift up your head.” In ',
      { xt: { text: 'v 13', usfm: 'GEN.40.13' } },
      ',  it is used idiomatically as “present you in public,” but in ',
      { xt: { text: 'v 19', usfm: 'GEN.40.19' } },
      ',  it is used literally, “lift your head up off of your body.”'
    ],
    actual: [
      'Notice the totally different usage of the words '
      + '“lift up your head.” In v 13, it is used idiomatically '
      + 'as “present you in public,” but in v 19, it is used literally, '
      + '“lift your head up off of your body.”'
    ],
  },
  { version: 'AMP', usfm: 'GEN.42.7', type: 'note.f (verse)',
    texts: [
      'Joseph was conversing with his brothers through an interpreter '
      + '(v 23).'
    ],
    expect: [
      'Joseph was conversing with his brothers through an interpreter (',
      { xt: { text: 'v 23', usfm: 'GEN.42.23' } },
      ').'
    ],
    actual: [
      'Joseph was conversing with his brothers through an interpreter '
      + '(v 23).'
    ],
  },
  { version: 'AMP', usfm: 'EZR.1.8', type: 'note.f (first raw chapter:verse)',
    texts: [
      'There is occasionally a debate over the identities of Sheshbazzar and Zerubbabel. Sheshbazzar was an older Jewish official who was appointed by Cyrus and served in Judah (5:24). Zerubbabel was a younger man who was recognized as a political leader among the Jews. He was the son of Shealtiel and an ancestor of Jesus (5:2; Matt 1:12, 13).',
    ],
    expect: [
      'There is occasionally a debate over the identities of Sheshbazzar and Zerubbabel. Sheshbazzar was an older Jewish official who was appointed by Cyrus and served in Judah (',
      { xt: { text: '5:24', usfm: 'EZR.5.24' } },
      '). Zerubbabel was a younger man who was recognized as a political leader among the Jews. He was the son of Shealtiel and an ancestor of Jesus (',
      { xt: { text: '5:2', usfm: 'EZR.5.2' } },
      '; ',
      { xt: { text: 'Matt 1:12, 13', usfm: 'MAT.1.12-13' } },
      ').',
    ],
    actual: [
      'There is occasionally a debate over the identities of Sheshbazzar and Zerubbabel. Sheshbazzar was an older Jewish official who was appointed by Cyrus and served in Judah (5:24). Zerubbabel was a younger man who was recognized as a political leader among the Jews. He was the son of Shealtiel and an ancestor of Jesus (5:2; ',
      { xt: { text: 'Matt 1:12, 13', usfm: 'MAT.1.12,13' } },
      ').',
    ],
  },
  { version: 'AMP', usfm: 'REV.12.10', type: 'note.f (chapter-range)',
    texts: [
      'This is the activity of Satan from which he has earned his name '
      + '(see note v 9). The activity is most clearly seen in Job 1-2 and '
      + 'in Zech 3.',
    ],
    expect: [
      'This is the activity of Satan from which he has earned his name (see note v 9). The activity is most clearly seen in ',
      { xt: { text: 'Job 1', usfm: 'JOB.1' } },
      '-',
      { xt: { text: '2', usfm: 'JOB.2' } },
      ' and in ',
      { xt: { text: 'Zech 3', usfm: 'ZEC.3' } },
      '.'
    ],
    actual: [
      'This is the activity of Satan from which he has earned his name (see note v 9). The activity is most clearly seen in ',
      { xt: { text: 'Job 1', usfm: 'JOB.1' } },
      '-2 and in ',
      { xt: { text: 'Zech 3', usfm: 'ZEC.3' } },
      '.',
    ],
  },
  /* AMP }
   *************************************************************************
   * BSB {
   */
  { version: 'BSB', usfm: 'EZK.40.7', type: 'note.f (verses)',
    texts: [
      '5 (long) cubits is approximately 8.75 feet or 2.7 meters; '
      + 'also in verses 30 and 48.',
    ],
    expect: [
      '5 (long) cubits is approximately 8.75 feet or 2.7 meters; also in '
      + 'verses ',
      { 'xt': { 'text': '30 and 48', 'usfm': 'EZK.40.30,48' } },
      '.',
    ],
    actual: [
      '5 (long) cubits is approximately 8.75 feet or 2.7 meters; '
      + 'also in verses 30 and 48.',
    ],
  },
  { version: 'BSB', usfm: 'EZK.42.16', type: 'note.f (verses)',
    texts: [
      'See LXX; five hundred cubits from verse 17 LXX and implied in verses '
      + '16, 18, 19, and 20 is approximately 875 feet or 266.7 meters '
      + 'in length. Hebrew five hundred reeds, with the measuring reed round '
      + 'about, that is approximately 5,250 feet or 1,600 meters; similarly '
      + 'in verses 17, 18, 19, and 20.',
    ],
    expect: [
      'See LXX; five hundred cubits from verse ',
      { xt: { text: '17', usfm: 'EZK.42.17' } },
      ' LXX and implied in ',
      { xt: { text: 'verses 16, 18, 19, and 20',
              usfm: 'EZK.42.16,18,19,20' } },
      ' is approximately 875 feet or 266.7 meters '
      + 'in length. Hebrew five hundred reeds, with the measuring reed round '
      + 'about, that is approximately 5,250 feet or 1,600 meters; similarly '
      + 'in ',
      { xt: { text: 'verses 17, 18, 19, and 20',
              usfm: 'EZK.42.17,18,19,20'} },
      '.',
    ],
    actual: [
      'See LXX; five hundred cubits from verse 17 LXX and implied in verses '
      + '16, 18, 19, and 20 is approximately 875 feet or 266.7 meters '
      + 'in length. Hebrew five hundred reeds, with the measuring reed round '
      + 'about, that is approximately 5,250 feet or 1,600 meters; similarly '
      + 'in verses 17, 18, 19, and 20.',
    ],
  },
  /* BSB }
   *************************************************************************
   * CEV {
   */
  { version: 'CEV', usfm: '2CH.34.30', type: 'note.f (verses)',
    texts: [
      "The Hebrew text has “The Book of God's Agreement,” which is the "
      + "same as “The Book of God's Law” in verses 15 and 19. In "
      + "traditional translations this is called “The Book of the Covenant.”"
    ],
    expect: [
      "The Hebrew text has “The Book of God's Agreement,” which is the same as “The Book of God's Law” in verses ",
      { xt: { text: '15', usfm: '2CH.34.15' } },
      ' and ',
      { xt: { text: '19', usfm: '2CH.34.19' } },
      '. In traditional translations this is called “The Book of the Covenant.”'
    ],
    actual: [
      "The Hebrew text has “The Book of God's Agreement,” which is the "
      + "same as “The Book of God's Law” in verses 15 and 19. In "
      + "traditional translations this is called “The Book of the Covenant.”"
    ],
  },
  /* CEV }
   *************************************************************************
   * ESV {
   */
  /* ESV }
   *************************************************************************
   * NIV11 {
   */
  { version: 'NIV11', usfm: 'GEN.2.5', type: 'note.f (verse)',
    texts: [ '; also in verse 6' ],
    expect: [
      '; also in ',
      { xt: { text: 'verse 6', usfm: 'GEN.2.6' } }
    ],
    actual: [ '; also in verse 6' ],
  },
  { version: 'NIV11', usfm: 'EZK.48.16', type: 'note.f (verses)',
    texts: [
      'That is, about 1 1/2 miles or about 2.4 kilometers; also in verses '
      + '30, 32, 33 and 34',
    ],
    expect: [
      'That is, about 1 1/2 miles or about 2.4 kilometers; also in verses ',
      { 'xt': { 'text': 'verses 30, 32, 33 and 34',
                'usfm': 'EZK.48.30,32,33,34' }
      },
    ],
    actual: [
      'That is, about 1 1/2 miles or about 2.4 kilometers; also in verses '
      + '30, 32, 33 and 34',
    ],
  },
  /* NIV11 }
   *
   * :TODO: Improperly parses }
   *************************************************************************/
];

module.exports = tests;
