/**
 *  Parsing for PDF chapters of the NIV84 version of the Bible.
 *
 */
const Fs 	  = require('fs/promises');
const Path  = require('path');
const Pdf   = require('pdf-parse');
const Books = require('./books');

/**
 *  Parsing for NIV84 PDF
 *
 *  When processing a page to extract text, the `textContent.items` will each
 *  have the form:
 *    { height  : The rendered height {Number};
 *      fontName: The font to render with {String};
 *      str     : The text content {String};
 *    }
 *
 *  Using these properties:
 *    Book name:
 *      str         'Genesis'
 *      height      576
 *      fontName    Times
 *
 *    Chapter numbers:
 *      str         '1'
 *      height      576
 *      fontName    Helvetica
 *
 *    Verse numbers:
 *      str         '2'
 *      height      41.99040000000001
 *      fontName    Helvetica
 *
 *    Text:
 *      height      100.40039999999999
 *      fontName    Helvetica
 *
 *    Verse separator spacing:
 *      str         ' '
 *      height      144
 *      width:      3
 *      fontName    Times
 */
class PdfBook {
  constructor() {
    this.fileName = null;
    this.pdf      = null;
    this.name     = null;
    this.ABBR     = null;
    this.json     = {};
  }

  /**
   *  Begin a new book
   *
   *  @method new_book
   *  @param  name  The name of this book {String};
   *
   *  @return `this` for a fluent interface
   */
  new_book( name ) {
    this.name = name
    this.ABBR = _nameToABBR( name );

    if (this.ABBR == null) {
      console.error('*** No ABBR found for[ %s ]:%s: ...',
                    this.name, name);
    }

    /*
    console.log('>>> new_book( %s ): %s', name, this.ABBR);
    // */

    this.json = {};

    this.new_chapter( 1 );

    return this;
  }

  /**
   *  Begin a new chapter
   *
   *  @method new_chapter
   *  @param  num   The new chapter number {Number};
   *
   *  @return `this` for a fluent interface
   */
  new_chapter( num ) {
    /*
    if (this.name   == null) {
      console.error('*** new_chapter( %s ):%s: Unexpected state for item:',
                    num, this.fileName, this._current_item);
    }

    if (this.chapter_num > 0 && num > this.chapter_num + 1) {
      console.error('*** new_chapter( %s ):%s: Skipped from %s:',
                    num, this.fileName, this.chapter_num,
                    this._current_item);
      console.error('*** new_chapter( %s ):%s: Previous verse:',
                    num, this.fileName,
                    this._prev_chapter);
    }
    // */

    /*
    console.log('>>> new_chapter( %s ): book[ %s:%s ]',
                num, this.ABBR, this.name);
    // */

    this.chapter_num = num;

    this.new_verse( 1 );

    this._prev_chapter = this._current_item;

    return this;
  }

  /**
   *  Begin a new verse
   *
   *  @method new_verse
   *  @param  num   The new verse number {Number};
   *
   *  @return `this` for a fluent interface
   */
  new_verse( num ) {
    /*
    if (this.name        == null ||
        this.chapter_num == null) {
      console.error('*** new_verse( %s ):%s: book[ %s ], chap[ %s ]: '
                    +     'Unexpected state for item:',
                    num, this.fileName, this.name, this.chapter_num,
                    this._current_item);
    }

    if (this.verse_num > 0 && num > this.verse_num + 1) {
      console.error('*** new_verse( %s ):%s: Skipped from %s:',
                    num, this.fileName, this.verse_num,
                    this._current_item);
      console.error('*** new_verse( %s ):%s: Previous verse:',
                    num, this.fileName,
                    this._prev_verse);
    }
    // */

    /*
    console.log('>>> new_verse( %s ): book[ %s:%s ], chapter[ %s ]',
                num, this.ABBR, this.name, this.chapter_num);
    // */

    this.verse_num = num;

    const id  = this.verse_id();

    this.verse = {
      markup: [
        { '#p': [
            { label: String( num ) },
          ],
        }
      ],
      text:   '',
    };

    this.json[ id ] = this.verse;

    this._prev_verse = this._current_item;

    return this;
  }

  /**
   *  Add the given text to the current chapter/verse.
   *
   *  @method add_text
   *  @param  text  The text to add {String};
   *
   *  @return `this` for a fluent interface
   */
  add_text( text ) {
    if (this.name        == null ||
        this.chapter_num == null ||
        this.verse_num   == null ||
        this.verse       == null) {
      /*
      console.error('*** add_verse( %s ):%s: '
                    +     'book[ %s ], chap[ %s ], vs[ %s ]: '
                    +     'Unexpected state for item:',
                    text, this.fileName,
                    this.name, this.chapter_num, this.verse_nu,
                    this._current_item);
      // */

      return this;
    }
    // assert( this.chapter_num != null )
    // assert( this.verse_num   != null )
    // assert( this.verse != null )

    /* Add to:
     *    this.verse.markup[0]['#p']
     *    this.verse.text
     */

    // Trim all leading and trailing white-space
    const trimmed = text.replaceAll(/(^\s+|\s+$)/g, '');
    if (trimmed.length < 1) {
      return;
    }

    /* Handle the case where the previous text did NOT end with white-space and
     * this text does NOT begin with white space. In that case, append this
     * text directly to theh previous markup BUT ONLY if the new text does NOT
     * begin with '\n'.
     */
    const continue_text = (this._continue_text && text[0] !== '\n');
    const last_char     = text[ text.length - 1 ];

    // Does this text appear to need continuation?
    this._continue_text = (last_char &&
                           last_char !== ' ' &&
                           last_char !== '\n');

    const markup  = this.verse.markup[0]['#p'];

    if (continue_text) {
      const idex  = markup.length - 1;
      const prev  = markup[ idex ];
      if (typeof(prev) !== 'string') {
        markup.push( trimmed );

      } else {
        const continued = prev + trimmed;

        /*
        console.log('>>> Continue text: prev[ %s ], trimmed[ %s ]:',
                    prev, trimmed, continued);
        // */
        markup[ idex ] = continued;
      }

    } else {
      markup.push( trimmed );

    }

    if (! continue_text && this.verse.text.length > 0) {
      this.verse.text += ' ';
    }
    this.verse.text += trimmed;

    return this;
  }

  /**
   *  Generate a absolute verse identifier for the current book, chapter, and
   *  verse.
   *  @method verse_id
   *
   *  @return The absolute verse identifier {String};
   */
  verse_id() {
    const book  = this.ABBR;
    const chp   = this.id_num( this.chapter_num );
    const vrs   = this.id_num( this.verse_num );

    return `${book}.${chp}.${vrs}`
  }

  /**
   *  Given a number, return it as a 3-digit value with leading 0.
   *
   *  @method id_num
   *  @param  num   The target number {Number};
   *
   *  @return The 3-digit value with leading 0's.
   */
  id_num( num ) {
    return String(num).padStart( 3, '0' );
  }

  /**
   *  Over-ride the pdf parsers render_page() method.
   *
   *  @method render_page
   *  @param  pageData    The page data;
   *
   *  @return A promise for the text of the page {Promise[String]};
   */
  render_page( pageData ) {
    const render_options = {
      /* replaces all occurrences of whitespace with standard spaces (0x20).
       * The default value is `false`.
       */
      normalizeWhitespace: true,  //false,

      /* do not attempt to combine same line TextItem's. The default value is
       * `false`.
       */
      disableCombineTextItems: false
    };

    return pageData.getTextContent( render_options )
      .then( (textContent) => {
        let lastY, text = '';
        //https://github.com/mozilla/pdf.js/issues/8963
        //https://github.com/mozilla/pdf.js/issues/2140
        //https://gist.github.com/hubgit/600ec0c224481e910d2a0f883a7b98e3
        //https://gist.github.com/hubgit/600ec0c224481e910d2a0f883a7b98e3
        for (let item of textContent.items) {
          this._current_item = item;

          /*
          console.log('item:', item);
          // */

          // Normalize white-space to a single space.
          let str           = item.str.replace(/[ ]+/g, ' ').trim();
          let add_to_verse  = true;

          if (this._isBook( item, str )) {
            // Book name
            add_to_verse = false;

            this.new_book( str );

            str = `Book: ${str}`;

          } else if (this._isChapter( item, str )) {
            // Chapter number
            add_to_verse = false;

            const chapter_num = _parseChapterLabel( str );

            if (Number.isNaN( chapter_num )) {
              console.error('*** Invalid chapter number[ %s ]:%s:',
                            str, this.fileName, item);
            }

            this.new_chapter( chapter_num );

            str = `Chapter: ${str}`;

          } else if (this._isVerse( item, str )) {
            // Verse number
            add_to_verse = false;

            const verse_num = _parseVerseLabel( str );

            if (Number.isNaN( verse_num )) {
              console.error('*** Invalid verse number[ %s ]:%s:',
                            str, this.fileName, item);
            }

            this.new_verse( verse_num );

            str = `Verse: ${str}`;
          }

          /*
          if (add_to_verse) {
            console.log('>>> Chapter %d, verse %s:',
                          chapter_num, verse_num, str);
          }
          // */

          if (lastY == item.transform[5] || !lastY){
            text += str;

            if (add_to_verse) {
              this.add_text( str );
            }
          }
          else{
            text += '\n' + str;

            if (add_to_verse) {
              this.add_text( '\n'+ str );
            }
          }

          lastY = item.transform[5];
        }
        //let strings = textContent.items.map(item => item.str);
        //let text = strings.join("\n");
        //text = text.replace(/[ ]+/ig," ");
        //ret.text = `${ret.text} ${text} \n\n`;

        return text;
      })
      .catch( (err) => {
        console.error('*** Parse error:', err);
      });
  }

  /**
   *  Parse the given PDF.
   *
   *  @method parse
   *  @param  path    The path to the PDF file {String};
   *
   *  @return A promise for results
   */
  async parse( path ) {
    this.path     = path;
    this.fileName = Path.basename( path );

    const options = {
      pagerender: this.render_page.bind( this ),
      max:        0,

      //check https://mozilla.github.io/pdf.js/getting_started/
      version: 'v1.10.100'
    }

    const dataBuffer  = await Fs.readFile( path );
    const data        = await Pdf( dataBuffer, options );

    this.data = data;

    // Include PDF parse information
    const { text, ...keep}  = data;
    this.pdf = keep;

    return this;
  }

  /**************************************************************************
   * Protected helpers {
   *
   */
  /**
   *  Determine if the given item represents a book name.
   *
   *  @method _isBook
   *  @param  item    The item {Object};
   *  @param  str     The trimmed version of item.str {String};
   *
   *  @return true | false
   *  @private
   */
  _isBook( item, str ) {
    const names = [
      'Zechariah',
      '1st Peter',
      'Revelation',
      'Mark',
      'uke',    // Split betwen lines L  uke'
    ];

    if (str.length < 1) { return false }

    if (str.match(/^\s*[0-9]+\s*$/)) {
      // Ignore all-numeric strings
      return false;
    }

    if (item.height > 1000) {
      return true;

    } else if (item.height == 576 && item.fontName === 'Times') {
      return true;

    } else if (names.includes( item.str.trim() )) {
      return true;
    }

    return false;
  }

  /**
   *  Determine if the given item represents a chapter label.
   *
   *  @method _isChapter
   *  @param  item    The item {Object};
   *  @param  str     The trimmed version of item.str {String};
   *
   *  @return true | false
   *  @private
   */
  _isChapter( item, str ) {
    if (str.length < 1) { return false }

    if (item.height > 200) {
      const num = _parseChapterLabel( str );

      if (! Number.isNaN( num )) {
        if (this.chapter_num &&
            (num === this.chapter_num ||
             num === this.chapter_num + 1)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   *  Determine if the given item represents a verse label.
   *
   *  @method _isVerse
   *  @param  item    The item {Object};
   *  @param  str     The trimmed version of item.str {String};
   *
   *  @return true | false
   *  @private
   */
  _isVerse( item, str ) {
    let res = false;

    if (str.length > 0) {
      let check_num = false;

      if (this.ABBR === 'PSA' && Math.floor( item.height ) === 121) {
        check_num = true;

      } else if ( (this.ABBR === 'ACT' || this.ABBR === 'JHN') &&
                    Math.floor( item.height ) === 80) {
        check_num = true;

      } else if (item.height < 42) {
        check_num = true;
      }

      if (check_num) {
        const num = _parseVerseLabel( str );

        if (! Number.isNaN( num )) {
          if (this.verse_num &&
              (num === this.verse_num ||
               num === this.verse_num + 1)) {
            res = true;
          }
        }
      }
    }

    /*
    console.log('_isVerse():%s: res[ %s ] : str[ %s ], item:',
                this.ABBR, String(res), str, item);
    // */

    return res;
  }
  /* Protected helpers }
   **************************************************************************/

}

/**
 *  Parse a single chapter PDF, writing the JSON results to the specified
 *  output directory.
 *
 *  @method parseBook
 *  @param  pdfPath   The path to the PDF file {String};
 *  @param  outDir    The path to the output directory {String};
 *
 *  @return A promise for results {Promise};
 */
async function parseBook( pdfPath, outDir ) {
  const book  = new PdfBook();

  try {
    /*
    console.log('>>> Parsing %s ...', pdfPath);
    // */
    await book.parse( pdfPath );

    const outFile = `${book.ABBR}.json`;
    const outPath = Path.join( outDir, outFile );

    /*
    console.log('>>> Output JSON to %s ...', outPath);
    // */

    await Fs.writeFile( outPath,
                        JSON.stringify( book.json, null, 2 ) );

  } catch(err) {
    console.error('*** Parsing %s FAILED:', pdfPath, err);
  }
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Parse a chapter label into a chapter number.
 *
 *  @method _parseChapterLabel
 *  @param  str   The text of the label {String};
 *
 *  @return The chapter number {Number};
 *  @private
 */
function _parseChapterLabel( str ) {
  let num = parseInt( str );

  if (Number.isNaN( num )) {
    // Handle chapter labels of the form 'PSALM 1'
    const parts = str.split(/\s+/);

    num = parseInt( parts.pop() );
  }

  return num;
}

/**
 *  Parse a verse label into a verse number.
 *
 *  @method _parseVerseLabel
 *  @param  str   The text of the label {String};
 *
 *  @return The verse number {Number};
 *  @private
 */
function _parseVerseLabel( str ) {
  return parseInt( str );
}

/**
 *  Fetch the canonical abbreviation of the given book string.
 *
 *  @method _nameToABBR
 *  @param  name    The given name {String};
 *
 *  :NOTE: We will first invoke Books.nameToABBR() and for those books that
 *         are NOT matched, perform additional logic to determine the canonical
 *         abbreviation.
 *
 *  @return The canonical abbreviation or null if not found {String};
 *  @private
 */
function _nameToABBR( name ) {
  let   ABBR    = Books.nameToABBR( name );
  if (ABBR == null) {
    if (name === 'uke') { // Split betwen lines L  uke'
      ABBR = Books.nameToABBR( 'Luke' );
    }
  }

  /*
  if (ABBR == null) {
    console.error('=== No match for [ %s ]', name);
  }
  // */

  return ABBR;
}
/* Private helpers }
 ****************************************************************************/

module.exports  = {
  PdfBook,

  parseBook,
};
// vi: ft=javascript
