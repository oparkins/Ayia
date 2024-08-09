/**
 *  PDF handler for the NIV-1984 Bibl.
 *
 */
const { SOURCE_URL } = require('./constants');

const Version = {
  id:                 9998,
  abbreviation:       'NIV84',
  local_abbreviation: 'NIV84',
  title:              'New International Version (1984)',
  local_title:        'New International Version (1984)',
  type:               'pdf',
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
    url: SOURCE_URL,
  },
  vrs: 'eng',
};

module.exports = {
  Version,
};
