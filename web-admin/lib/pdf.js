const Fs            = require('fs');

const { readFile }  = require('fs/promises');
const PDFDocument   = require('pdfkit');

const AYIA_API      = 'https://api.ayia.nibious.com/api/v2';
//                                      versions/%VERS%/%BOK%.ccc.vvv[-vvv]

const Refs          = require('./refs');
const Books         = require('../lib/books');
const Versions      = require('../versions');

// Import ESM {
const importSync    = require('import-sync');
const Path          = require('path');

const {parse_verse} = importSync( '../../web-ui/src/lib/verse_ref',
                                  { basePath: Path.dirname( __filename ) } );
// Import ESM }

const Font  = {
  chapter : {
    name  : 'Chapter',
    usage : 'BookStudy: Book name and Chapter nubers',
    size  : 18,  // 2x verse text
    source: '/usr/share/fonts/opentype/urw-base35/NimbusRoman-Bold.otf',
  },
  verse : {
    name  : 'Verse',
    usage : 'BookStudy/MemoryCard: Verse numbers (super-script)',
    size  : 12, // 1.333x verse text
    source: '/usr/share/fonts/opentype/urw-base35/NimbusRoman-Bold.otf',
  },

  header  : {
    name  : 'Card-Header',
    usage : 'MemoryCard: Reference',
    size  : 12,
    source: '/usr/share/fonts/opentype/urw-base35/NimbusRoman-Bold.otf',
  },

  key     : {
    name  : 'Card-Key',
    usage : 'MemoryCard: Memory key',
    size  : 9,
    source: '/usr/share/fonts/opentype/urw-base35/NimbusRoman-Bold.otf',
  },

  text  : {
    name  : 'Text',
    usage : 'BookStudy/MemoryCard: Verse text',
    size  : 9,  // 1/8"
    source: '/usr/share/fonts/opentype/urw-base35/NimbusRoman-Regular.otf',
  },
};

/***************************************************************************/

class StudyBook {
  /**
   *  A class to generate a study layout for a specific book of the Bible.
   *
   *  :NOTE: Measurements are typically in points: 72 points == 1"
   */

  // Generated PDF Document (via generate()) {PDFDocument};
  doc = null;

  // Default layout
  layout        = {
    layout  : 'landscape',
    margins : {
      top   : 54, // 3/4"
      right : 54,
      bottom: 54,
      left  : 54,
    },
  };

  // General text options
  Text_opts = {
    columns     : 2,
    continued   : true,
    features    : [],

    columnGap   : 24, // ~ 5/16"
    lineGap     : 24,
    paragraphGap: 0,
  };

  /**
   *  Create a new instance for the given version.
   *
   *  @constructor
   *  @param  versionName   The name of the target version {String};
   *  @param  bookName      The name of the target book {String};
   */
  constructor( versionName, bookName ) {
    this.versionName  = versionName;
    this.bookName     = bookName;

    this.bookAbbr     = Books.nameToABBR( this.bookName );
    this.book         = Books.getBook( this.bookAbbr );
    if (this.book == null) {
      console.error('*** Unknown book: %s', this.bookName);
      return;
    }

    this.versions     = null;
    this.version      = null;

    this.Font         = {...Font};
  }

  /**
   *  Generate the PDF for a specific book
   *
   *  @method generate
   *  @param  [opts]                      Generation options {Object};
   *  @param  [opts.linePerVerse = false] If truthy, generate each verse as its
   *                                      own line {Boolean};
   *  @param  [opts.baseFont = 9]         The size, in points, of the base
   *                                      font (verse). MAY be used to scale all
   *                                      other font sizes depending on
   *                                      `scaleFonts` {Number};
   *  @param  [opts.scaleFonts = false]   Scale all fonts according to the
   *                                      selected base font {Boolean};
   *
   *  @param  [opts.fromCache = false]    If truthy, use the local cache
   *                                      instead of the Ayia API {Boolean};
   *
   *  @return A promise for results {Promise};
   */
  async generate( opts = null ) {
    opts = Object.assign( { linePerVerse: false,
                            baseFont    : this.Font.text.size,
                            scaleFonts  : false,
                            fromCache   : false,
                          }, opts || {} );

    if (opts.baseFont !== this.Font.text.size) {
      this.Font.text.size    = baseFont;

      if (opts.scaleFonts) {
        // Re-compute font sizes
        this.Font.chapter.size = Math.round( baseFont * 2 );
        this.Font.verse.size   = Math.round( baseFont * 1.333 );
      }

      console.log('=== Adjust fonts: text[ %s ], chapter[ %s ], verse[ %s ]',
                  this.Font.text.size, this.Font.chapter.size,
                  this.Font.verse.size);
    }

    // Fetch all chapters for the named version
    const chapters  = await this.fetchChapters( opts.fromCache );

    this.doc = new PDFDocument( this.layout );

    _registerFonts( this.doc, this.Font );

    let curChap = null;

    this.doc.font(     this.Font.chapter.name )
            .fontSize( this.Font.chapter.size )
            .text( this.book.name,  { ...this.Text_opts, continued: false } );

    Object.entries( chapters ).forEach( ([ref, entry]) => {
      const [abbr, chapText, versText]  = ref.split('.');

      if (chapText.startsWith('INTRO')) { return }

      const chap  = parseInt( chapText );
      const verse = parseInt( versText );

      /*
      console.log('=== ref[ %s ]: abbr[ %s ], chap[ %s : %s ], vers[ %s : %s ]',
                  ref, abbr, chapText, chap, versText, verse);
      // */

      if (chap !== curChap) {
        // New chapter
        this.doc.font(     this.Font.chapter.name )
                .fontSize( this.Font.chapter.size );

        if (! opts.linePerVerse && chap !== 1) {
           this.doc.text( `\n `, this.Text_opts );
        }

        this.doc.text( `${chap} `, this.Text_opts );
        curChap = chap;
      }

      const verse_opts  = { ... this.Text_opts, features: ['sups'] };
      if (opts.linePerVerse) {
        // Line-per-verse
        this.doc.font(     this.Font.verse.name )
                .fontSize( this.Font.verse.size )
                .text(`${verse}`, verse_opts )
                .font(     this.Font.text.name )
                .fontSize( this.Font.text.size )
                .text(`${entry.text}\n `, this.Text_opts);
      } else {
        /* No line seperating verses
         *
         * No-Break-Space
         *    represented similarly to a space character, it prevents an
         *    automatic line break
         *      &nbsp;  \U00A0
         *
         * Figure Space
         *    a space somewhat equal to the figures (0–9) characters.
         *      &#8199; \U2007
         *
         * Narrow No-Break Space
         *    used to separate a suffix from a word stem without indicating a
         *    word boundary. Approximately 1/3 the representative space of a
         *    normal space though it may vary by font
         *      &#8239; &nnbsp; \u202f
         *
         *  Word-Joiner
         *    representative by no visible character, it prohibits a line break
         *    at its position.
         *      \u2060
         *
         * non-breaking, zero-width space
         *      \uFEFF
         */
        this.doc.font(     this.Font.verse.name )
                .fontSize( this.Font.verse.size )
                .text(`  ${verse}\u202f`, verse_opts )
                .font(     this.Font.text.name )
                .fontSize( this.Font.text.size )
                .text(`${entry.text} `, this.Text_opts);

      }
    });

    return this;
  }

  /**
   *  Write the generated PDF to the given file/path.
   *
   *  @method write
   *  @param  path    The target output file/path {String};
   *
   *  @return `this` for a fluent interface;
   */
  write( path ) {
    if (this.doc == null) {
      console.error('The document has not yet been generated');

    } else {
      this.doc.pipe( Fs.createWriteStream( path ) );
      this.doc.end();

      this.doc = null;
    }

    return this;
  }

  /**
   *  Fetch the chapters for the target version and book.
   *
   *  @method fetchChapters
   *  @param  [fromCache]   If truthy, fetch from cache instead of Ayia
   *                        {Boolean};
   *
   *  @return The chapter data {Object};
   *            { %BOK.chp.vrs%: { markup, text }, ... }
   */
  async fetchChapters( fromCache = false ) {
    if (fromCache) {
      return this._fetchChaptersFromCache();
    }

    return this._fetchChaptersFromAyia();
  }

  /**************************************************************************
   * Protected methods {
   *
   */

  /**
   *  Fetch the chapters for the target version and book from the local cache.
   *
   *  @method _fetchChaptersFromCache
   *
   *  @return The chapter data {Object};
   *            { %BOK.chp.vrs%: { markup, text }, ... }
   *  @protected
   */
  async _fetchChaptersFromCache() {
    if (this.version == null) {
      this.version = await _fetchVersionFromCache( this.versionName );
      if (this.version == null) {
        throw new Error( `Unknown version: ${versionName}` );
      }

      /*
      console.log('_fetchChaptersFromCache(): version[ %s ]:',
                  this.versionName, this.version);
      // */
    }

    return _fetchChaptersFromCache( this.version, this.book );
  }

  /**
   *  Fetch the chapters for the target version and book from Ayia.
   *
   *  @method _fetchChaptersFromAyia
   *
   *  @return The chapter data {Object};
   *            { %BOK.chp.vrs%: { markup, text }, ... }
   *  @protected
   */
  async _fetchChaptersFromAyia() {
    return _fetchChaptersFromAyia( this.versionName, this.book );
  }
  /* Protected methods }
   **************************************************************************/
}

/***************************************************************************/

class MemoryCards {
  /**
   *  A class to generate a memory card layout for a specific set of memory
   *  verses.
   *
   *  :NOTE: Measurements are typically in points: 72 points == 1"
   */

  // Generated PDF Document (via generate()) {PDFDocument};
  doc = null;

  // Default layout
  layout        = {
    layout  : 'portrait',
    margins : {
      top   : 18, // 1/4"
      right : 18,
      bottom: 18,
      left  : 18,
    },
  };

  columns = 2;
  rows    = 6;

  /**
   *  Create a new instance for the given version.
   *
   *  @constructor
   *  @param  versionName   The name of the target version {String};
   */
  constructor( versionName ) {
    this.versionName  = versionName;
    this.versions     = null;
    this.version      = null;

    this.Font         = {...Font};
  }

  /**
   *  Generate the memory card PDF for a specific set of verses.
   *
   *  @method generate
   *  @param  verses                      The set of memory verses {Array};
   *                                        [ { ref, key }, ... ]
   *  @param  [opts]                      Generation options {Object};
   *  @param  [opts.baseFont = 9]         The size, in points, of the base
   *                                      font (verse). MAY be used to scale all
   *                                      other font sizes depending on
   *                                      `scaleFonts` {Number};
   *  @param  [opts.scaleFonts = false]   Scale all fonts according to the
   *                                      selected base font {Boolean};
   *
   *  @param  [opts.fromCache = false]    If truthy, use the local cache
   *                                      instead of the Ayia API {Boolean};
   *
   *  @return A promise for results {Promise};
   *            - on success, this {MemoryCards};
   *            - on failure, an error {Error};
   */
  async generate( verses, opts = null ) {
    opts = Object.assign( { baseFont    : this.Font.text.size,
                            scaleFonts  : false,
                            fromCache   : false,
                          }, opts || {} );

    // Walk through gathered verses and generate a card for each
    this.doc = new PDFDocument( this.layout );

    _registerFonts( this.doc, this.Font );

    this.card0 = this._computeCardLayout( opts );

    console.log('=== Adjusted card measurements:', this.card0);

    // Gather all target verses.
    const fullVerses  = await this.gatherVerses( verses, opts.fromCache );

    fullVerses.forEach( (verseInfo, index) => {
      this._generateCard( verseInfo, index );
    });

    // Finally, generate dashed cut marks between each card
    this._generateDashes();

    return this;
  }

  /**
   *  Write the generated PDF to the given file/path.
   *
   *  @method write
   *  @param  path    The target output file/path {String};
   *
   *  @return `this` for a fluent interface;
   */
  write( path ) {
    if (this.doc == null) {
      console.error('The document has not yet been generated');

    } else {
      this.doc.pipe( Fs.createWriteStream( path ) );
      this.doc.end();

      this.doc = null;
    }

    return this;
  }

  /**
   *  Asynchronously gather verse information.
   *
   *  @method gatherVerses
   *  @param  verses      The set of memory verses {Array};
   *                        [ { ref, key }, ... ]
   *  @param  [fromCache] If truthy, gather verses from locally cached data
   *                      instead of Ayia {Boolean};
   *
   *  @return A promise for results {Promise};
   *            - on success, the fully resolved verses {Array};
   *                [ { ref, key, norm_ref, verses }, ... ]
   *            - on failure, an error {Error};
   */
  async gatherVerses( verses, fromCache = false ) {
    /***
     * We can either fetch verses from the Ayia API
     * OR, if we have cached version data, fetch them from the local cache.
     */
    if (fromCache) {
      return this._gatherVersesFromCache( verses );
    }

    return this._gatherVersesFromAyia( verses );
  }

  /**************************************************************************
   * Protected methods {
   *
   */

  /**
   *  Compute the layout of the first card based upon the provided options.
   *
   *  @method _computeCardLayout
   *  @param  opts              Generation options {Object};
   *  @param  opts.baseFont     The size, in points, of the base font (verse).
   *                            MAY be used to scale all other font sizes
   *                            depending on `scaleFonts` {Number};
   *  @param  opts.scaleFonts   Scale all fonts according to the selected base
   *                            font {Boolean};
   *
   *  @return The layout data {Object};
   *            { top, left, width, height, margin,
   *              ref : {top, left, width, height },
   *              key : {top, left, width, height },
   *              text: {top, left, width, height },
   *            }
   */
  _computeCardLayout( opts ) {
    /* Compute position, width, and height for the first card and its
     * components.
     *
     *  - 8.5" x 11" portrait paper
     *  - .25" page margin
     *  - 2 columns per page with 6 cards per column
     *  - 1/8"  margin within each card
     *  - 1/16" between cards vertically
     *  - 1/2"  between cards horizontally
     *
     *     |                      612 (8.5")                 |
     *     | |       288 (4")       |     288 (4")         | |
     *     +-------------------------------------------------+
     *     |18   279 (3-7/8")      18     279 (3-7/8")       |
     *     | +--------------------+   +--------------------+ |-< 18
     *     | | Ref1          Key1 |   | Ref7          Key7 | |
     *     | |                    |   |                    | | 117 (1-5/8")
     *     | | Text 1             |   | Text 7             | |
     *     | |                    |   |                    | |
     *     | +--------------------+   +--------------------+ |-
     *     |18                                               |
     *     | +--------------------+   +--------------------+ |
     *
     */
    const pageWidth     = (8.5 * 72);
    const pageHeight    = (11  * 72);
    const innerWidth    = pageWidth
                        - this.layout.margins.left -
                        - this.layout.margins.right;
    const innerHeight   = pageHeight
                        - this.layout.margins.top -
                        - this.layout.margins.bottom;

    const card  = {
      top     : 18,   //   1/4"
      left    : 18,   //   1/4"
      width   : 279,  // 3-7/8" (innerWidth  / 2 - margin / 2)
      height  : 117,  // 1-5/8" (innerHeight / 6 - margin / 2)
      padding : 0,    //
      margin  : 18,   //  ~1/16"

      header: {
        top   : 18,   //   1/4"   (card.top  + card.padding)
        left  : 18,   //   1/4"   (card.left + card.padding)
        width : 279,  // 3-7/8"
        height: -1,   // computed based upon font size
      },
      text: {
        margin: 12,   //   .166"
        top   : -1,   // header.top + header.height + text.margin
        left  : 18,   //   1/4"
        width : 279,  // 3-7/8"
        height: -1,   // card.top + card.height - text.top
      },
    };

    if (opts.baseFont !== this.Font.text.size) {
      // Re-compute font sizes
      this.Font.text.size   = opts.baseFont;

      if (opts.scaleFonts) {
        this.Font.verse.size  = Math.round( baseFont * 1.333 );
        this.Font.header.size = this.Font.verse.size;
        this.Font.key.size    = this.Font.text.size;
      }

      console.log('=== Adjust fonts: text[ %s ], header[ %s ], verse[ %s ]',
                  this.Font.text.size, this.Font.header.size,
                  this.Font.verse.size);
    }

    /* Measure the height of a header and adjust card0 measurements
     *    card0.ref.height  = height
     *    card0.key.height  = height
     *    card0.text.top    = card0.ref.top + height
     *    card0.text.height = card0.height  - height
     */
    this.doc.font(     this.Font.header.name )
            .fontSize( this.Font.header.size );

    const width   = this.doc.widthOfString('X');
    const height  = Math.round( this.doc.widthOfString('X', {width} ) );

    card.header.height  = height;
    card.text.top       = card.header.top + height + card.text.margin;
    card.text.height    = card.top
                           + card.height
                           - card.text.top;

    return card;
  }

  /**
   *  Generate a card for a single memory verse.
   *
   *  @method _generateCard
   *  @param  memVerse  The target memory verse {Object};
   *                      { ref     : The user-provided verse reference
   *                                  {String};
   *                        key     : The user-provided memory key {String};
   *
   *                        norm_ref: The normalized reference {String};
   *                        verses  : The text of all target verses, indexed by
   *                                  verse number {Object};
   *                          { %verseNum%: Verse text {String}, ... .}
   *                      }
   *  @param  index     The index of this card {Number};
   *
   *  @return this for a fluent interface;
   *  @protected
   */
  _generateCard( memVerse, index ) {
    const ref       = memVerse.norm_ref;
    const memKey    = memVerse.key;
    const perPage   = this.rows * this.columns;
    const page      = Math.floor( index / perPage );
    const inPage    = (index % perPage);
    const column    = Math.floor( inPage / this.rows );
    const row       = (inPage % this.rows );
    const margin    = this.card0.margin;
    const offset    = {
      top : row    * (this.card0.height + margin),
      left: column * (this.card0.width  + margin),
      /*
      top : row    * this.card0.height,
      left: column * this.card0.width,
      // */
    };
    const position  = {
      header : {...this.card0.header,
        top : this.card0.header.top  + offset.top,
        left: this.card0.header.left + offset.left,
      },
      text: {...this.card0.text,
        top : this.card0.text.top  + offset.top,
        left: this.card0.text.left + offset.left,
      },
    };

    console.log('%s: %s / %s:',
                index, ref, memKey);
    /*
    console.log('=== page %d, inPage %d, grid: %d, %d, offset:',
                page, inPage, column, row, offset);
    console.log('=== position:', position);
    // */

    const header_opts = {
      width     : position.header.width,
      height    : position.header.height,
      continued : true,
    };
    const text_opts   = {
      features  : [],
      width     : position.text.width,
      height    : position.text.height,
      continued : true,
    };
    const verse_opts  = { ...text_opts,
      features  : ['sups'],
    };

    this.doc.font(     this.Font.header.name )
            .fontSize( this.Font.header.size )
            .text( `${index+1}: ${ref}`,
                    position.header.left, // x
                    position.header.top,  // y
                    header_opts )
            .font(     this.Font.key.name )
            .fontSize( this.Font.key.size )
            .text( memKey, { align: 'right' } )
            .moveDown();

    const verses    = Object.entries( memVerse.verses );
    const count     = verses.length;
    let   is_first  = true;
    verses.forEach( ([verseNum, text], idex) => {
      const is_last = (idex == count -1);
      const vref    = `  ${verseNum}\u202f`;
      const topts   = {...text_opts};
      const vopts   = {...verse_opts};

      this.doc.font(     this.Font.verse.name )
              .fontSize( this.Font.verse.size );

      if (is_first) {
        console.log('=== first verse');
        this.doc.text(  vref,
                        position.text.left, // x
                        position.text.top,  // y
                        vopts );

        is_first = false;

      } else {
        this.doc.text( vref, vopts );

      }

      if (is_last)  {
        console.log('=== last verse');
        topts.continued = false;
      }

      this.doc.font(     this.Font.text.name )
              .fontSize( this.Font.text.size )
              .text(`${text} `, topts );

      console.log('  %s:', verseNum, text);
    });

    console.log('=======================================================');
  }

  /**
   *  Add dashed cut marks between each card.
   *
   *  @method _generateDashes
   *
   *  @return void
   *  @protected
   */
  _generateDashes() {
    const pageWidth     = (8.5 * 72);
    const pageHeight    = (11  * 72);
    const innerWidth    = pageWidth
                        - this.layout.margins.left -
                        - this.layout.margins.right;
    const innerHeight   = pageHeight
                        - this.layout.margins.top -
                        - this.layout.margins.bottom;


    /* First the vertical down the center of the page just before/beyond the
     * page margin.
     */
    const centerX = pageWidth / 2;
    const startY  = this.layout.margins.top - 9;
    const endY    = innerHeight - 9;

    this.doc.dash(1)
            .moveTo( centerX, startY )
            .lineTo( centerX, endY )
            .strokeOpacity( 0.25 )
            .stroke();

    // Now, the horizontal lines between cards
    const startX  = this.layout.margins.left - 9;
    const endX    = innerWidth - 9;
    const margin  = this.card0.margin;
    for (let row = 1; row < this.rows; row++) {
      let y = (row * this.card0.height)
            + ((row-1) * margin)
            + (margin / 2);

      this.doc.dash(1)
              .moveTo( startX, y )
              .lineTo( endX,   y )
              .strokeOpacity( 0.25 )
              .stroke();
    }
  }

  /**
   *  Asynchronously gather verse information from the Ayia API.
   *
   *  @method _gatherVersesFromAyia
   *  @param  verses    The set of memory verses {Array};
   *                      [ { ref, key }, ... ]
   *
   *  @return A promise for results {Promise};
   *            - on success, the fully resolved verses {Array};
   *                [ { ref, key, norm_ref, verses }, ... ]
   *            - on failure, an error {Error};
   *  @protected
   */
  async _gatherVersesFromAyia( verses ) {
    if (this.versions == null) {
      this.versions = await _fetchVersionsFromAyia();

      /*
      console.log('_gatherVersesFromAyia(): versions:', this.versions);
      // */
    }

    const fullVerses  = [];
    const pending     = verses.map( async (verseInfo, idex) => {
      const memKey  = verseInfo.key;
      const refData = parse_verse( verseInfo.ref, this.versions );
      /*  refData = {
       *    book      : 'Hebrews ',
       *    chapter   : 11,
       *    verse     : 6,
       *    verses    : [ 6 ],
       *    ui_ref    : 'Hebrews 11:6',
       *    url_ref   : 'HEB.011.006',
       *    full_book : {
       *      abbr  : 'HEB',
       *      name  : 'Hebrews',
       *      match : /^(heb?(rews)?)$/i,
       *      order : 58,
       *      loc   : 'New Testament',
       *      verses: [ 0, 14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25 ],
       *    },
       *  }
       */
      if (refData == null) {
        console.warn('=== Cannot parse:', verseInfo);
        return;
      }

      verseInfo.norm_ref = refData.ui_ref;
      verseInfo.verses   = {};

      // Fetch the verses
      const verseData = await _fetchVersesFromAyia( this.versionName, 
                                                    refData.url_ref );

      /*
      console.log('_gatherVersesFromAyia(): version[ %s ], ref[ %s ]:',
                  this.versionName, refData.url_ref, verseData);
      // */

      Object.entries( verseData.verses ).forEach( ([key, verse]) => {
        const [book, chap, vers]  = key.split('.');
        const verseNum            = parseInt( vers );

        verseInfo.verses[ verseNum ] = verse.text;
      });

      fullVerses[ idex ] = verseInfo;

      /* Fetch the text for each referenced verse
      verseInfo.verses = {};
      refData.verses.forEach( verseNum => {
        const ref   = Refs.sortable( refData.full_book.abbr,
                                     refData.chapter,
                                     verseNum );
        const verse = verses[ ref ];

        verseInfo.verses[ verseNum ] = verse.text;
      });
      // */
    });

    // Await full resolution
    await Promise.all( pending );

    return fullVerses;
  }

  /**
   *  Asynchronously gather verse information from the local cache.
   *
   *  @method _gatherVersesFromCache
   *  @param  verses    The set of memory verses {Array};
   *                      [ { ref, key }, ... ]
   *
   *  @return A promise for results {Promise};
   *            - on success, the fully resolved verses {Array};
   *                [ { ref, key, norm_ref, verses }, ... ]
   *            - on failure, an error {Error};
   *  @protected
   */
  async _gatherVersesFromCache( verses ) {
    let versions  = this.versions;

    if (this.version == null) {
      this.version = await _fetchVersionFromCache( this.versionName );
      if (this.version == null) {
        throw new Error( `Unknown version: ${versionName}` );
      }

      console.log('_gatherVersesFromCache(): version[ %s ]:',
                  this.versionName, this.version);
    }

    if (this.versions == null) {
      // Construct a pseudo-versions set
      versions  = {
        versions: [ this.version ],
        books   : Books.getBooks( 'ot,nt' ),
      };

      this.versions = versions;
    }

    /* First walk through all memory verses and resolve them to their
     * constituent verses.
     */
    const bookCache   = {};
    const fullVerses  = [];
    const pending     = verses.map( async (verseInfo, idex) => {
      const memKey  = verseInfo.key;
      const refData = parse_verse( verseInfo.ref, versions );
      /*  refData = {
       *    book      : 'Hebrews ',
       *    chapter   : 11,
       *    verse     : 6,
       *    verses    : [ 6 ],
       *    ui_ref    : 'Hebrews 11:6',
       *    url_ref   : 'HEB.011.006',
       *    full_book : {
       *      abbr  : 'HEB',
       *      name  : 'Hebrews',
       *      match : /^(heb?(rews)?)$/i,
       *      order : 58,
       *      loc   : 'New Testament',
       *      verses: [ 0, 14, 18, 19, 16, 14, 20, 28, 13, 28, 39, 40, 29, 25 ],
       *    },
       *  }
       */
      if (refData == null) {
        console.warn('=== Cannot parse:', verseInfo);
        return;
      }

      // Fetch (and cache) all verses for the target book
      const book      = refData.full_book;
      let   verses    = bookCache[ book.abbr ];
      if ( ! Array.isArray( verses )) {
        verses = await _fetchChaptersFromCache( this.version, book );
        /*  verses = {
         *    %verse-ref%: {  // e.g. '1PE.001.001'
         *      markup: [
         *        { %type%: ... },
         *        ...
         *      ],
         *      text:   Raw text of this verse {String};
         *    },
         *    ...
         *  }
         */
        bookCache[ book.abbr ] = verses;
      }

      //console.log('%s verses:', book.abbr, verses);
      verseInfo.norm_ref = refData.ui_ref;

      // Fetch the text for each referenced verse
      verseInfo.verses = {};
      refData.verses.forEach( verseNum => {
        const ref   = Refs.sortable( refData.full_book.abbr,
                                     refData.chapter,
                                     verseNum );
        const verse = verses[ ref ];

        verseInfo.verses[ verseNum ] = verse.text;
      });

      fullVerses[ idex ] = verseInfo;
    });

    // Await full resolution
    await Promise.all( pending );

    return fullVerses;
  }

  /* Protected methods }
   **************************************************************************/
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Register the specified fonts in the new PDF document.
 *
 *  @method _registerFonts
 *  @param  doc     The target document {PDFDocument};
 *  @param  fonts   Information about the fonts to register {Object};
 *                    { chapter : { name, size, source },
 *                      verse   : { name, size, source },
 *                      text    : { name, size, source },
 *                    }
 *
 *
 *  @return `doc`
 *  @private
 */
function _registerFonts( doc, fonts ) {
  Object.values( fonts ).forEach( (font) => {
    if (font.name == null || font.source == null) {
      return;
    }

    /*
    console.log('>>> Register font [%s%s]: %s',
                font.name, (font.family ? ` : ${font.family}` : ''),
                font.source);
    // */

    doc.registerFont( font.name, font.source, font.family );
  });

  return doc;
}

/****************************************************************************
 * Cache helpers {
 *
 */

/**
 *  Fetch information about the target version from the local cache.
 *
 *  @method _fetchVersionFromCache
 *  @param  versionName     The name of the target version {String};
 *
 *  @return Information about the target version {Object};
 *            { id, abbreviation, title }
 */
async function _fetchVersionFromCache( versionName ) {
  return Versions.find( {vers: versionName} );
}

/**
 *  Retrieve the data (verses referenced by BOK.chap.vers) for the identified
 *  book.
 *
 *  @method _fetchChaptersFromCache
 *  @param  version   The target version {Version};
 *  @param  book      The target book {Book};
 *                      { abbr, name, loc, verses }
 *
 *  @return A promise for verse data for the target book {Promise};
 *            { %verse-ref%: {  // e.g. '1PE.001.001'
 *                markup: [
 *                  { %type%: ... },
 *                  ...
 *                ],
 *                text:   Raw text of this verse {String};
 *              },
 *              ...
 *            }
 *  @protected
 */
async function _fetchChaptersFromCache( version, book ) {
  const res       = {};
  const bookAbbr  = book.abbr;
  const config    = {
    version : version,
    /*
    vers    : versionName,
    // */
  };
  const cacheDir  = await Versions.prepare( config );

  // assert( typeof(cacheDir) === 'string' );
  const jsonPath  = `${cacheDir}/${bookAbbr}.json`;

  /*
  console.log('=== _fetchChaptersFromCache( %s ):', bookAbbr, jsonPath);
  // */

  const jsonData  = await readFile( jsonPath );
  const chapters  = JSON.parse( jsonData );

  /*
  console.log('=== _fetchChaptersFromCache( %s ): chapters:',
              bookAbbr, chapters);
  // */

  return chapters;
}

/* Cache helpers }
 ****************************************************************************
 * Ayia helpers {
 *
 */

/**
 *  Fetch the given path from the Ayia API.
 *
 *  @method _fetchFromAyia
 *  @param  path    The target API endpoint {String};
 *
 *  @return The returned, json-decoded data {Object};
 *  @private
 */
async function _fetchFromAyia( path ) {
  const url      = `${AYIA_API}/${path}`;
  const opts    = { headers: {Accept: 'application/json'} };

  /*
  console.log('_fetchFromAyia(): %s ...', url);
  // */

  const response = await fetch( url, opts );
  if (response.status !== 200) {
    console.error('*** Versions not found: %s',
                  versionName, response.status);
    return null;
  }

  const contentType = response.headers.get('content-type');
  if (contentType == null || !contentType.startsWith('application/json')) {
    console.error('*** Unexpected content type: %s', contentType);
    return null;
  }

  return await response.json();
}

/**
 *  Fetch the full set of available versions from the Ayia API.
 *
 *  @method _fetchVersionsFromAyia
 *
 *  @return The set of all known versions {Object};
 */
async function _fetchVersionsFromAyia() {
  return await _fetchFromAyia( 'versions' );
}

/**
 *  Retrieve the data (verses referenced by BOK.chap.vers) for the identified
 *  book.
 *
 *  @method _fetchChaptersFromAyia
 *  @param  versionName   The name of the target version {String};
 *  @param  book          The target book {Book};
 *                          { abbr, name, loc, verses }
 *
 *  @return A promise for verse data for the target book {Promise};
 *            { %verse-ref%: {  // e.g. '1PE.001.001'
 *                markup: [
 *                  { %type%: ... },
 *                  ...
 *                ],
 *                text:   Raw text of this verse {String};
 *              },
 *              ...
 *            }
 *  @protected
 */
async function _fetchChaptersFromAyia( versionName, book ) {
  const verses      = {};
  const bookPath    = `versions/${versionName}/${book.abbr}`;
  const numChapters = book.verses.length;

  for (let idex = 1; idex <= numChapters; idex++) {
    const data  = await _fetchFromAyia( `${bookPath}.${idex}` );

    Object.assign( verses, data.verses );
  }

  return verses;
}

/**
 *  Fetch information about the target version from Ayia.
 *
 *  @method _fetchVersionFromAyia
 *  @param  versionName     The name of the target version {String};
 *
 *  @return Information about the target version {Object};
 *            { id, abbreviation, title }
 */
async function _fetchVersionFromAyia( versionName ) {
  return _fetchFromAyia( `versions/${versionName}` );
}

/**
 *  Fetch a set of verses from the Ayia API.
 *
 *  @method _fetchVersesFromAyia
 *  @param  versionName     The name of the target version {String};
 *  @param  verseRef        The target verse referrence {String};
 *
 *  @return The set of verses {Object};
 *            { %BOK.chp.vrs%: { markup, text }, ... }
 */
async function _fetchVersesFromAyia( versionName, verseRef ) {
  return _fetchFromAyia( `versions/${versionName}/${verseRef}` );
}

/* Ayia helpers }
 ****************************************************************************/

/**
 * Superscript (using an OpenType font that supports super/sub-scripts)
 *  doc.text('Some text', {continued: true});
 *  doc.text('a', {features: ['sups'], continued: true});
 *  doc.text(', some more text.', {features: []});
 *
 * Using multiple columns:
 *  const lorem = 'Lorem ipsum dolor sit amet, ...'
 *  doc.text(lorem, { columns   : 3,
 *                    columnGap : 15,
 *                    height    : 100,
 *                    width     : 465,
 *                    align     : 'justify',
 *                  } );
 *
 * Landscape the entire document (disable 'autoFirstPage'):
 *  const doc = new PDFDocument({ autoFirstPage: false });
 *  doc.addPage(  { size  : 'LEGAL',
 *                  layout: 'landscape',
 *                } );
 *
 * Built-in fonts:
 *  - Courier
 *  - Courier-Bold
 *  - Courier-Oblique
 *  - Courier-BoldOblique
 *  - Helvetica
 *  - Helvetica-Bold
 *  - Helvetica-Oblique
 *  - Helvetica-BoldOblique
 *  - Symbol
 *  - Times-Roman
 *  - Times-Bold
 *  - Times-Italic
 *  - Times-BoldItalic
 *  - ZapfDingbats
 *
 * OpenType fonts:
 *  Noto Sans CJK JP    /usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc
 *
 * https://www.reddit.com/r/typography/comments/ci4nwk/otf_vs_ttf/
 *  In the modern era of font development, OTF and TTF are very, very similar.
 *  - OTF stands for Postscript-flavored OpenType.
 *  - TTF stands for Truetype-flavored Opentype.
 *
 * Measurements are in Points where 72 points == 1"
 */

/* Private helpers }
 ****************************************************************************/

module.exports = {
  StudyBook,
  MemoryCards,
};
