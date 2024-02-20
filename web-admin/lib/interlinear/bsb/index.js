/**
 *  Interlinear handler for the Bearean Standard Bible.
 *
 */
const { fetch }   = require('./fetch');
const { parse }   = require('./parse');
const { toJson }  = require('./toJson');

const Version = {
  id:                 9999,
  abbreviation:       'BSB-IL',
  local_abbreviation: 'BSB-IL',
  title:              'Berean Standard Bible (Interlinear)',
  local_title:        'Berean Standard Bible (Interlinear)',
  language: {
    iso_639_1:      'en',
    iso_639_3:      'eng',
    name:           'English',
    local_name:     'English',
    text_direction: 'ltr',
    language_tag:   'eng',
    secondary_language_tags: [ 'heb', 'hbo', 'grc' ],
  },
  offline: {
    url: 'https://bereanbible.com/bsb_tables.xlsx',
  },
  vrs: 'eng',

  handler:  {
    fetch,
    parse,
    toJson,
  },
};

module.exports = {
  Version,
};
