/**
 *  Convert a Bible version fetched via `Bible.getVersion()` to JSON format.
 *
 */
const Cheerio = require('cheerio');

/**
 *  Convert a Bible version fetched via `Bible.getVersion()` to JSON format.
 *
 *  @method toJson
 *  @param  data          The Bible data fetched via `Bibld.getVersion()`
 *                        {Object};
 *  @param  [ref_filter]  If provided, only present books, chapters, and verses
 *                        that match the filter ( BOK[.CHAPTER[.VERSE]] )
 *                        {String};
 *
 *  @return The parsed data {Object};
 */
function toJson( data, ref_filter=null ) {
  const json = { ...data, books:{} };

  Object.entries(data.books).forEach( ([key,val]) => {
    const bookJson  = _parseBook( key, val, ref_filter );

    if (bookJson) { json.books[key] = bookJson }
  });

  return json;
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Parse a single book.
 *  @method _parseBook
 *  @param  abbrev        The book abbreviation {String};
 *  @param  chapters      The chapter data for this book {Object};
 *  @param  [ref_filter]  If provided, only present books, chapters, and verses
 *                        that match the filter ( BOK[.CHAPTER[.VERSE]] )
 *                        {String};
 *
 *  @return A simple object representing the given book {Object | undefined};
 *  @private
 */
function _parseBook( abbrev, chapters, ref_filter = null ) {
  const [ only_book, only_ch, only_vs ] = (typeof(ref_filter) === 'string'
                                            ? ref_filter.split('.')
                                            : []);
  if (only_book && only_book !== abbrev) { return }

  let filter  = null;
  if (only_book) {
    filter = only_book;

    if (only_ch) {
      filter += `.${only_ch}`;
      if (only_vs)  { filter += `.${only_vs}([+]|$)` }
      else          { filter += '.[0-9]' }
    }

    filter = new RegExp( filter.replaceAll('.', '\\.'), 'i' );

    /*
    console.log('_parseBook(): ref_filter[ %s ] => [ %s / %s / %s ]',
                  ref_filter, only_book, only_ch, only_vs);
    console.log('_parseBook(): filter: %s', filter);
    // */
  }

  /*
  console.log('_parseBook( %s ): ref_filter[ %s ] => '
              +   'only_book[ %s ], only_ch[ %s ], only_vs[ %s ] => %s',
              abbrev, ref_filter, only_book, only_ch, only_vs);
  // */

  const bkJson  = {
    metadata: [],
    chapters: {},
  };
  Object.entries( chapters ).forEach( ([chp, lines]) => {
    if (only_ch && only_ch != chp) { return }

    const $         = Cheerio.load( lines.join( '' ) );
    const $intros   = $( '.intro' );

    /*
    console.log('chp %s: %d intros, %d chapter children ...',
                chp, $intros.length, $chaps.length);
    // */

    if ($intros.length > 0) {
      /*******************************************************
       * Process this as an introduction with no verses
       *
       */
      const usfm  = _getAttr( $intros[0], 'data-usfm' );

      if (filter && !filter.test( usfm )) { return }

      bkJson.chapters[ chp ] = _parseIntro( $, $intros, filter );
      return;
    }

    /*********************************************************
     * Process this as a chapter with verses
     *
     */
    const $chaps    = $( '.chapter' ).children();
    bkJson.chapters[ chp ] = _parseChapter( $, $chaps, filter );
  });

  return bkJson;
}

/**
 *  Parse an introduction.
 *  @method _parseIntro
 *  @param  $       The top-level Cheerio instance {Cheerio};
 *  @param  $intro  The intro element(s) {Cheerio};
 *  @param  filter  If provided, a filter to limit the output {RegExp};
 *
 *  @return A simple object representing the intro {Object};
 *  @private
 */
function _parseIntro( $, $intro, filter ) {
  const introJson = {
    content : [],
  };

  $intro.children().each( (jdex, el) => {
    const json  = _parseEl( $, el );

    /*
    console.log('-- intro %s: %d:', chp, jdex, json);
    // */

    introJson.content.push( json );
  });

  return introJson;
}

/**
 *  Parse a chapter.
 *  @method _parseChapter
 *  @param  $       The top-level Cheerio instance {Cheerio};
 *  @param  $chap   The chapter element(s) {Cheerio};
 *  @param  filter  If provided, a filter to limit the output {RegExp};
 *
 *  @return A simple object representing the chapter {Object};
 *  @private
 */
function _parseChapter( $, $chap, filter ) {
  /* Use a Map to merge all elements that comprise verses (.verse[data-usfm])
   * into arrays indexed by verse reference (data-usfm).
   *
   * Any non-verse metadata will be added to the previous "verse".
   * Metadata found before the first verse will be placed in the chapter
   * metadata array.
   */
  const chJson  = {
    verse_count : 0,
    metadata    : [],
    verses      : {},
    fullText    : {},
  };
  const verses    = new Map();
  const fullText  = new Map();
  let   verse     = chJson.metadata;

  $chap.each( (jdex, el) => {
    /* Remember the "label" for this child element.
     *
     * We will use this to label any verse elements that are raw text so all
     * entries in 'verse' end up being objects with a markup type
     * (e.g.  label, p, li1).
     */
    const classes = _getClasses( el );
    const cls0    = (classes.length > 0 && classes.shift());
    const label   = (cls0 || el.type)
                  + (classes.length > 0
                      ? '.' + classes.join('.')
                      : '');

    // Locate and process any 'verse' elements within this child
    const $verse  = $(el).find('.verse[data-usfm]');
    if ($verse.length > 0) {
      $verse.each( (kdex, vs) => {
        const usfm  = _getAttr( vs, 'data-usfm' );
        if (filter && !filter.test( usfm )) { return }

        verse = (verses.get( usfm ) || []);

        const curText = (fullText.get( usfm ) || []);
        const json    = _parseEl( $, vs );
        const key     = Object.keys( json ).shift();
        const val     = json[key];

        if (Array.isArray(val)) {
          val.forEach( item => {
            const text  = _verseText( label, item );
            if (text) { curText.push( text ) }

            if (typeof(item) === 'string') {
              // Label this raw text with our parent label
              verse.push( {[label]:item} );

            } else {
              verse.push( item );
            }
          });

        } else {
          // Label this sub-item with our parent label
          const text  = _verseText( label, json[key] );
          if (text) { curText.push( text ) }

          verse.push( {[label]:json[key]} );
        }

        verses.set(   usfm, verse );
        fullText.set( usfm, curText );
      });

    } else {
      /* There are no verses so process the child directly and add it to the 
       * previous verse set.
       *
       * This is how we maintain inter-verse metadata.
       *
       * It appears at the end of the verse after which the metadata is
       * found.
       */
      const elJson  = _parseEl( $, el );

      verse.push( elJson );
    }
  });

  // Record the verse count
  chJson.verse_count = verses.size;

  /* Flatten our `verses` map into a simpler `verse` object within the
   * containing chapter, indexed by verse number.
   */
  verses.forEach( (verse, id) => {
    const [ bk, ch, vs ]  = id.split('.');
    const text            = fullText.get( id )
                              .join(' ')
                              .replaceAll(/\s+/g, ' ')
                              .trim();
    chJson.verses[ vs ] = verse;
    chJson.fullText[ vs ] = text;
  });

  return chJson;
}

/**
 *  Given a label and object, extract verse-related text.
 *  @method _verseText
 *  @param  label   The label to be applied to this item {String};
 *  @param  item    The verse-related item {Object | String};
 *
 *  @return Verse-related text {String | undefined};
 *  @private
 */
function _verseText( label, item ) {
  const exclude = [
    'label', 'note.f', 'note.fe', 'note.ef', 'note.x', 'note.ex',
  ];

  if (exclude.includes(label))    { return }
  if (typeof(item) === 'string')  { return item };

  const text    = [];
  for (let key in item) {
    if (exclude.includes(key))  { continue }

    const val = item[key];
    if (typeof(val) === 'string') {
      text.push( val );
    }
  }

  return text.join(' ');
}

/**
 *  Parse a single line of chapter HTML.
 *  @method _parseEl
 *  @param  $               The top-level Cheerio instance {Cheerio};
 *  @param  el              The target HTML element {Object};
 *
 *  @return A simple object representing the given element
 *          {Object | undefined};
 *  @private
 */
function _parseEl( $, el ) {
  const classes   = _getClasses( el );
  const cls0      = (classes.length > 0 && classes.shift());
  const $el       = $(el);
  const label     = (cls0 || el.type)
                  + (classes.length > 0
                        ? '.' + classes.join('.')
                        : '');
  const children  = el.children || [];  //$el.children();
  let   json;

  // Flatten elements that are 'content' or 'heading'
  if (label === 'content') {
    return $el.text();
  }
  if (label === 'heading') {
    return $el.text();
  }

  if (children.length < 1) {
    // NO children
    if (label === 'text') {
      // JUST a text node so no need for a 'text' label
      json = $el.text();

    } else {
      json = {
        [label]: $el.text(),
      };
    }
    return json;
  }

  // Recursively parse all children
  let ar  = [];
  children.forEach( (ch, jdex) => {
    const chJson  = _parseEl( $, ch );
    if (chJson) {
      if (chJson.body) {
        // Flatten this child's body...
        if (Array.isArray(chJson.body)) {
          // Merge this array into the top-level set
          ar = ar.concat( chJson.body );
        } else {
          // Push  item into the top-level set
          ar.push( chJson.body );
        }

      } else {
        // Push the entire child json into the top-level set
        ar.push( chJson );
      }
    }
  });

  if (ar.length === 1) {
    // Replace this single-item array with just the item.
    ar = ar.pop();
  }

  return {
    [label]: ar,
  };
}

/**
 *  Fetch the specified attribute from the given element.
 *  @method _getAttr
 *  @param  el    The target element {Cheerio};
 *  @param  attr  The target attribute {String};
 *
 *  @return The value of the attribute {String | undefined};
 *  @private
 */
function _getAttr( el, attr ) {
  if (el.attribs == null) { return }

  return el.attribs[ attr ];
}

/**
 *  Fetch an array of CSS classes for the given element.
 *  @method _getClasses
 *  @param  el  The target element {Cheerio};
 *
 *  @return The array of CSS classes {Array};
 *  @private
 */
function _getClasses( el ) {
  const attrCls = _getAttr( el, 'class' ) || '';
  const classes = attrCls.split(/\s+/).filter( str => str.length > 0 );

  return classes;
}

/* Private helpers }
 ****************************************************************************/

module.exports  = {
  toJson,
};
// vi: ft=javascript
