/**
 *  Parsing for PDF chapters of the NIV84 version of the Bible.
 *
 */
const Fs 	      = require('fs/promises');
const Path      = require('path');
const PDFParser = require('pdf2json');
const Books     = require('./books');
const Refs      = require('./refs');

/**
 *  Parsing for NIV84 PDF using pdf2json.
 *
 *  When processing page content, each item in `Texts` represents a text block
 *  and has the form:
 *      { x: 10.79,               // relative x position
 *        y: 2.333,               // relative y position
 *        w: 3.531,
 *        oc: "#3365cc",          // clr: a color index in color
 *                                // dictionary, same 'clr' field as in
 *                                // 'Fill' object. If a color can't be
 *                                // found in color dictionary, 'oc' field
 *                                // will be added to the field as
 *                                // 'original color" value.
 *                                //  import {
 *                                //    kColors,
 *                                //    kFontFaces,
 *                                //    kFontStyles } from "pdf2json";
 *        sw: 0.32553125,
 *        A: "left",              // Alignment
 *        R: [                    // Text runs
 *          { T: "Genesis%20",    // Text
 *            S: -1,              // style index from style dictionary.
 *                                // More info about 'Style Dictionary' can
 *                                // be found at 'Dictionary Reference'
 *                                // section
 *            TS: [ 0, 28, 1, 0 ] // Type Style: [  fontFaceId,
 *                                //                fontSize,
 *                                //                1/0 for bold,
 *                                //                1/0 for italic]
 *          }
 *        ]
 *      }
 *
 *  Book name:
 *    oc: '#3365cc'
 *    R:   [
 *      { T: "Genesis%20",
 *        TS[1] == font-size  > 24
 *        TS[2] == bold       often 1
 *      }
 *    ]
 *
 *  Chapter number:
 *    oc: != null
 *    R:   [
 *      { T: "1"
 *        TS[1] == font-size  ===         book font size
 *        TS[2] == bold       often 1
 *      }
 *    ]
 *
 *  Verse number:
 *    oc: != null
 *    R:   [
 *      { T: "1"
 *        TS[1] == font-size  < 40%         Book font
 *      }
 *    ]
 *
 *  Text:
 *    oc: == null
 *    R:   [
 *      { T: "In the beginning
 *        TS[1] == font-size  > 40% < 50%   Book font
 *      }
 *    ]
 *
 */
class PdfBook {
  constructor() {
    this._resetState();
  }

  /**
   *  Parse the given PDF path
   *
   *  @method parse
   *  @param  path    The path to the target PDF file {String};
   *
   *  @return A promise for results {Promise};
   */
  parse( path ) {
    this._resetState( new PDFParser() );
    this.file_name = path;

    /* This deferred promise will be resolved/rejectd via the parser event
     * handlers.
     */
    this._promise = this._deferred();

    this.parser.on( 'error',    this._onError.bind( this ) );
    this.parser.on( 'readable', this._onReadable.bind( this ) );
    this.parser.on( 'data',     this._onData.bind( this ) );

    this.parser.loadPDF( path );

    return this._promise;
  }


  /**************************************************************************
   * Protected methods {
   *
   */

  /**
   *  Begin a new book
   *
   *  @method _new_book
   *  @param  name  The name of this book {String};
   *
   *  @return `this` for a fluent interface
   *  @protected
   */
  _new_book( name ) {
    this.book_name = name
    this.ABBR      = Books.nameToABBR( name );

    if (this.ABBR == null) {
      console.error('*** No ABBR found for[ %s ]:%s: ...',
                    this.book_name, name);
    }

    /*
    console.log('>>> _new_book( %s ): %s', name, this.ABBR);
    // */

    this.json = {};

    this._new_chapter( 1 );

    return this;
  }

  /**
   *  Begin a new chapter
   *
   *  @method _new_chapter
   *  @param  num   The new chapter number {Number};
   *
   *  @return `this` for a fluent interface
   */
  _new_chapter( num ) {
    /*
    console.log('>>> _new_chapter( %s ): book[ %s:%s ]',
                num, this.ABBR, this.book_name);
    // */

    this.chapter_num = num;

    this._new_verse( 1 );

    return this;
  }

  /**
   *  Begin a new verse
   *
   *  @method _new_verse
   *  @param  num   The new verse number {Number};
   *
   *  @return `this` for a fluent interface
   */
  _new_verse( num ) {
    /*
    console.log('>>> _new_verse( %s ): book[ %s:%s ], chapter[ %s ]',
                num, this.ABBR, this.book_name, this.chapter_num);
    // */

    this.verse_num = num;

    const id  = Refs.sortable( this.ABBR,
                               this.chapter_num,
                               this.verse_num );

    this.verse = {
      markup: [
        { label: String( num ) },
        //{ 'p': '' },
      ],
      text:   '',
    };

    this.json[ id ] = this.verse;

    return this;
  }

  /**
   *  Add the given text to the current chapter/verse.
   *
   *  @method _add_text
   *  @param  text  The text to add {String};
   *
   *  @return `this` for a fluent interface
   */
  _add_text( text ) {
    if (this.book_name   == null ||
        this.chapter_num == null ||
        this.verse_num   == null ||
        this.verse       == null) {
      /*
      console.error('*** _add_text( %s ):%s: '
                    +     'book[ %s ], chap[ %s ], vs[ %s ]: '
                    +     'Unexpected state for text[ %s ] ...',
                    text, this.file_name,
                    this.book_name, this.chapter_num, this.verse_num,
                    text);
      // */

      return this;
    }
    // assert( this.chapter_num != null )
    // assert( this.verse_num   != null )
    // assert( this.verse       != null )

    /*
    console.log('>>> _add_text( %s ):%s: '
                  +     'book[ %s ], chap[ %s ], vs[ %s ]: [ %s ]',
                  text, this.file_name,
                  this.book_name, this.chapter_num, this.verse_num,
                  text);
    // */

    /* Add to:
     *    this.verse.markup
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
    const markup        = this.verse.markup;
    const prev_continue = this._continue_text;
    const continue_text = (this._continue_text || text[0] !== '\n');
    const last_char     = text[ text.length - 1 ];

    // Does this text appear to need continuation?
    this._continue_text = (last_char &&
                           last_char !== ' ' &&
                           last_char !== '\n');

    /*
    console.log('>>> _add_text():%s: '
                  +     'book[ %s ], chap[ %s ], vs[ %s ]: [%s] -- %s / %s',
                  this.file_name,
                  this.book_name, this.chapter_num, this.verse_num,
                  text,
                  (continue_text       ? 'continue' : 'new-line'),
                  (this._continue_text ? 'continue' : 'no-continue'));
    // */

    if (continue_text) {
      const last_entry  = markup.length - 1;
      const prev_text   = markup[ last_entry ].p;

      if (typeof(prev_text) !== 'string') {
        // Push a new paragraph entry
        markup.push( {p: trimmed} );

      } else {
        // Update the previous paragraph text
        const join      = (prev_text.length < 1 || prev_continue ? '' : ' ');
        const continued = prev_text + join + trimmed;

        markup[ last_entry ].p = continued;
      }

    } else {
      // Push a new paragraph entry
      markup.push( {p: trimmed} );
    }

    if (! prev_continue && this.verse.text.length > 0) {
      this.verse.text += ' ';
    }
    this.verse.text += trimmed;

    return this;
  }

  /**
   *  Create a deferred promise with resolve() and reject() methods.
   *
   *  @method _deferred
   *
   *  @return The deferred promise {Promise};
   *  @protected
   */
  _deferred() {
    const deferred = {
      resolve : null,
      reject  : null,
      promise : null,
    };

    deferred.promise = new Promise( (resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject  = reject;
    });

    deferred.promise.resolve = deferred.resolve;
    deferred.promise.reject  = deferred.resolve;

    return deferred.promise;
  }

  /**
   *  Reset the parse state.
   *
   *  @method _resetState
   *  @param  parser    The new PDF parser {PDFParser};
   *
   *  @return void
   *  @protected
   */
  _resetState( parser ) {
    if (this.parser) {
      this.parser.removeAllListeners();
    }

    if (this._promise) {
      this._promise.reject('RESET');
      this._promise = null;
    }

    this.parser      = parser;
    this.file_name   = null;

    this.meta        = null;
    this.page_num    = 0;

    this.book_name   = null;
    this.ABBR        = null;
    this.chapter_num = null;
    this.verse_num   = null;

    this.font_sizes  = {
      book    : null,
      chapter : null,
      verse   : null,
      text    : null,
    };

    this.need_sizes  = true;

    this.json = {};
  }

  /**
   *  Given final JSON data, sort and reorder.
   *
   *  @method _sortByKey
   *  @param  json    The JSON data to sort {Object};
   *
   *  @return The sorted JSON data {Object};
   *  @protected
   */
  _sortByKey( json ) {
    const sorted  = {};

    Object.keys( json ).sort().forEach( key => {
      sorted[ key ] = json[ key ];
    });

    return sorted;
  }

  /**
   *  Handle an 'error' event from PDFParser.
   *
   *  @method _onError
   *  @param  err   The error {Error};
   *
   *  @return void
   *  @protected
   */
  _onError( err ) {
    console.error('*** Parser Error:', err);

    this._promise.reject( err );
    this._promise = null;
    this._resetState();
  }

  /**
   *  Handle an 'readable' event from PDFParser.
   *
   *  @method _onReadable
   *  @param  meta  PDF metadata {Object};
   *
   *  @return void
   *  @protected
   */
  _onReadable( meta ) {
    /*  meta: {
     *    Transcoder: 'pdf2json@3.1.3 [https://github.com/modesty/pdf2json]',           
     *    Meta: {                                                                       
     *      PDFFormatVersion: '1.7',                                                    
     *      IsAcroFormPresent: false,                                                   
     *      IsXFAPresent: false,                                                        
     *      Creator: 'Nitro Pro',                                                       
     *      ModDate: "D:20121221211636+08'00'",                                         
     *      Metadata: {}                                                                
     *    }     
     * }
     */

    /*
    console.log('>>> Parser Readable:', meta);
    // */

    this.meta = meta;
  }

  /**
   *  Handle an 'data' event from PDFParser.
   *
   *  @method _onData
   *  @param  page    The page data {Object};
   *
   *  @return void
   *  @protected
   */
  _onData( page ) {
    if (page == null) {
      /*
      console.log('All %d pages complete', this.page_num);
      // */

      const sorted  = this._sortByKey( this.json );

      this._promise.resolve( sorted );
      return;
    }

    /*  page: {
     *    Width: 27,                  // Page width  (page units)
     *    Height: 36,                 // Page height (page units)
     *    HLines: [],                 // Horizontal lines
     *    VLines: [],                 // Vertical lines
     *    Fills: [],                  // Rectangular color fills
     *    Texts: [                    // Text blocks
     *      { x: 10.79,               // relative x position
     *        y: 2.333,               // relative y position
     *        w: 3.531,
     *        oc: "#3365cc",          // clr: a color index in color
     *                                // dictionary, same 'clr' field as in
     *                                // 'Fill' object. If a color can't be
     *                                // found in color dictionary, 'oc' field
     *                                // will be added to the field as
     *                                // 'original color" value.
     *                                //  import {
     *                                //    kColors,
     *                                //    kFontFaces,
     *                                //    kFontStyles } from "pdf2json";
     *        sw: 0.32553125,
     *        A: "left",              // Alignment
     *        R: [                    // Text runs
     *          { T: "Genesis%20",    // Text
     *            S: -1,              // style index from style dictionary.
     *                                // More info about 'Style Dictionary' can
     *                                // be found at 'Dictionary Reference'
     *                                // section
     *            TS: [ 0, 28, 1, 0 ] // Type Style: [  fontFaceId,
     *                                //                fontSize,
     *                                //                1/0 for bold,
     *                                //                1/0 for italic]
     *          }
     *        ]
     *      }
     *    ],
     *    ...
     * }
     */
    this.page_num++;

    /*
    console.log('Parser Data: page %d, %d Texts ...',
                this.page_num, page.Texts.length);
    // */

    try {
      let orphan  = '';
      let lastY;
      let lastClr;
      page.Texts.forEach( item => {
        const color = (item.clr || item.oc);
        let str     = '';

        item.R.forEach( run => {
          const [ fontFace, fontSize, bold, italic ]  = run.TS;

          run.color    = color;
          run.fontFace = fontFace;
          run.fontSize = fontSize;
          run.bold     = bold;
          run.italic   = italic;
          run.text     = decodeURIComponent( run.T );
          run.nonWs    = run.text.trim().length;

          /*
          console.log('Run:', run);
          // */

          if (run.nonWs < 1) {
            // No actions on empty text
            return;
          }

          if (this.need_sizes) {
            this._determineFontSizes( run );
          }

          if ( this._isBook( run ) ) {
            // Book name
            this._new_book( orphan + run.text.trim() );

            orphan = '';

          } else if ( this._isChapter( run ) ) {
            // Chapter label
            const num = parseInt( run.text.trim().split(/\s+/).pop() );

            this._new_chapter( num );

          } else if ( this._isVerse( run ) ) {
            // Verse label
            const num = parseInt( run.text.trim().split(/\s+/).pop() );

            this._new_verse( num );

          } else if ( this._isText( run ) ) {
            // Normal text
            str += run.text;

          } else if ( ! run.text.match(/^[0-9]+$/) ) {
            orphan += run.text;
          }
        });

        if (str.length > 0) {
          if ( lastY == null || lastY == item.y ) {
            this._add_text( str );

          } else {
            this._add_text( '\n' + str );

          }
        }

        lastClr = color;
        lastY   = item.y;
      });

      /*
      console.log('Parser Data: page %d: complete',
                  this.page_num);
      // */

    } catch(ex) {
      this._onError( ex );
    }
  }

  /**
   *  Is the given text run within a text block a book name?
   *
   *  @method _isBook
   *  @param  run   The (augmented) text run within `block` {Object};
   *
   *  @return true | false {Boolean};
   *  @protected
   */
  _isBook( run ) {
    let res = false;

    if ( this.book_name == null && run.nonWs > 1 && run.color &&
         run.fontSize === this.font_sizes.book ) {

      this.book_name = run.text.trim();

      res = true;
    }

    return res;
  }

  /**
   *  Is the given text run within a text block a chapter label?
   *
   *  @method _isChapter
   *  @param  run   The (augmented) text run within `block` {Object};
   *
   *  @return true | false {Boolean};
   *  @protected
   */
  _isChapter( run ) {
    let res = false;

    if ( run.nonWs > 0 && run.color &&
         run.fontSize === this.font_sizes.chapter ) {

      const num = parseInt( run.text.trim().split(/\s+/).pop() );

      res = (! Number.isNaN( num ));

      //this.chapter_num = parseInt( run.text.trim().split(/\s+/).pop() );
    }

    return res;
  }

  /**
   *  Is the given text run within a text block a verse label?
   *
   *  @method _isVerse
   *  @param  run   The (augmented) text run within `block` {Object};
   *
   *  @return true | false {Boolean};
   *  @protected
   */
  _isVerse( run ) {
    let res = false;

    if ( run.nonWs > 0 && run.color &&
         run.fontSize < this.font_sizes.chapter ) {

      const num = parseInt( run.text.trim().split(/\s+/).pop() );

      res = (! Number.isNaN( num ));

      //this.verse_num = parseInt( run.text.trim().split(/\s+/).pop() );
    }

    return res;
  }

  /**
   *  Is the given text run within a text block a normal text item?
   *
   *  @method _isText
   *  @param  run   The (augmented) text run within `block` {Object};
   *
   *  @return true | false {Boolean};
   *  @protected
   */
  _isText( run ) {
    let res = false;

    if ( run.nonWs > 0 && run.color == null &&
         run.fontSize < this.font_sizes.chapter ) {

      res = true;
    }

    return res;
  }

  /**
   *  Given a text run within a text block, if we have not yet determined all
   *  font sizes, do so now.
   *
   *  @method _determineFontSizes
   *  @param  run   The (augmented) text run within `block` {Object};
   *
   *  @return void
   *  @protected
   */
  _determineFontSizes( run ) {
    if (! this.need_sizes) {
      // All sizes already determined
      return;
    }

    if (run.nonWs < 1) {
      // No font size determinations with no text
    }

    if (run.color) {
      // This will be a Book, Chapter, or Verse font
      if (run.fontSize > 20) {
        if (this.font_sizes.book == null) {
          // Book font
          this.font_sizes.book = run.fontSize;

          /*
          console.log('=== Book font[ %s ], text[ %s ]',
                      run.fontSize, run.text);
          // */

        } else if (this.font_sizes.chapter == null) {
          // Chapter font
          this.font_sizes.chapter = run.fontSize;

          /*
          console.log('=== Chapter font[ %s ], text[ %s ]',
                      run.fontSize, run.text);
          // */
        }

      } else if (run.fontSize < 17) {
        // Verse font
        if (this.font_sizes.verse == null) {
          this.font_sizes.verse = run.fontSize;

          /*
          console.log('=== Verse font[ %s ], text[ %s ]',
                      run.fontSize, run.text);
          // */
          
        }
      }
    } else if (this.font_sizes.text == null) {
      // Non-color, normal body font
      this.font_sizes.text = run.fontSize;

      /*
      console.log('=== Text font[ %s ], text[ %s ]',
                  run.fontSize, run.text);
      // */
    }

    // Update the need_sizes indicator
    this.need_sizes = Object.values( this.font_sizes ).reduce( (res, val) => {
                        return (res || (val == null));
                      }, false);
  }
  /* Protected methods }
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
    const json    = await book.parse( pdfPath );

    const outFile = `${book.ABBR}.json`;
    const outPath = Path.join( outDir, outFile );

    /*
    console.log('>>> Output JSON to %s ...', outPath);
    // */

    await Fs.writeFile( outPath,
                        JSON.stringify( json, null, 2 ) );

  } catch(err) {
    console.error('*** Parsing %s FAILED:', pdfPath, err);
  }
}

module.exports  = {
  PdfBook,

  parseBook,
};
// vi: ft=javascript
