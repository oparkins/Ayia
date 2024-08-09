/**
 *  As of 2024-08-09, the NIV-1984 version of the Bible in PDF format is
 *  available, one file per book, via:
 *    https://www.christunite.com/index.php/bible/niv-1984-bible-pdf
 *
 *    The URLs for each book are contained in this page
 *
 *    The NIV-1984 in a single PDF:
 *      https://www.turnbacktogod.com/wp-content/uploads/2011/02/NIV-Bible-PDF.pdf
 */
const Path            = require('path');
const { PATH_CACHE }  = require('../../constants');

// Shared constants
const SOURCE_URL  = 'https://www.christunite.com/index.php/bible/niv-1984-bible-pdf'
const PATH_PDF    = Path.join( PATH_CACHE, 'NIV84-pdf' );

module.exports  = {
  PATH_CACHE,

  SOURCE_URL,
  PATH_PDF,
};
