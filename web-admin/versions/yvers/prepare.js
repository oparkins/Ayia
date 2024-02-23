/**
 *  Convert a Bible version fetched and extracted via `Yvers.extract()` to a
 *  normalized, database ready JSON format.
 *
 */
const Path            = require('path');
const Fs              = require('fs/promises');
const Cheerio         = require('cheerio');
const Books           = require('../../lib/books');
const Refs            = require('../../lib/refs');
const FsUtils         = require('../../lib/fs_utils');

const { PATH_CACHE }  = require('./constants');
const Extract         = require('./extract');

/**
 *  Convert a Bible version fetched and extracted via `Yvers.extract()` to a
 *  normalized, database ready JSON format.
 *
 *  @method prepare_version
 *  @param  config                  Conversion configuration {Object};
 *  @param  config.vers             The target version {String};
 *  @param  [config.version = null] If provided, extracted information for the
 *                                  target version (Yvers.extract.version()).
 *                                  If this is provided, `config.vers` may be
 *                                  omitted {Version};
 *  @param  [config.outPath = null] A specific output path for the generated
 *                                  JSON {String};
 *  @param  [config.force = false]  If truthy, convert even if the output
 *                                  already exists {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *  @param  [config.returnVersion = false]
 *                                  If truthy, return the top-level version
 *                                  data {Boolean};
 *
 *  @return A promise for results {Promise};
 *          - on success, the path to the location holding the generated JSON
 *                        data or the top-level version data
 *                        {String | Version};
 *          - on failure, an error {Error};
 *
 */
async function prepare_version( config ) {
  if (config == null) { throw new Error('Missing required config') }

  config  = Object.assign({
              force     : false,
              verbosity : 0,
            }, config || {});

  let version = config.version;
  if (version == null) {
    if (config.vers == null) {
      throw new Error('Missing required config.vers | config.versions');
    }

    /* Ensure version data has been extracted and retrieve the top-level
     * version information.
     */
    const configExtract = {
      vers          : config.vers,
      verbosity     : config.verbosity,
      returnVersion : true,
    };

    version = await Extract.version( configExtract );
    if (version == null) {
      throw new Error(`Cannot find/extract version ${config.vers}`);
    }
  }

  // Update `config` using the official abbreviation
  const ABBR  = version.abbreviation;
  if (config.outPath == null) {
    config.outPath = Path.join( PATH_CACHE, ABBR );
  }

  // Prepare the cache location before checking for existence
  await FsUtils.make_dir( config.outPath );

  const versPath  = Path.join( config.outPath, 'version.json' );
  const isCached  = await FsUtils.exists( versPath );

  if (config.force || ! isCached) {
    /* Ensure version.type reflects this source, but excludes the raw 'books'
     * and '_cache'
     */
    const json  = { ...version, type:'yvers' };
    delete json.books;
    delete json._cache;

    if (config.verbosity) {
      console.log('>>> Prepare %s: cache version data ...', ABBR);
    }

    await Fs.writeFile( versPath, JSON.stringify( json, null, 2 )+'\n' );

  } else if (config.verbosity) {
      console.log('>>> Prepare %s: version data exists', ABBR);
  }

  const pending = Object.entries(version.books).map( async ([key,val]) => {
    const bookPath  = Path.join( config.outPath, `${key}.json` );
    const isCached  = await FsUtils.exists( bookPath );

    if (config.force || ! isCached) {
      if (config.verbosity) {
        console.log('>>> Prepare %s: %s parsing ...', ABBR, key);
      }

      const bookJson  = _parseBook( key, val );

      if (bookJson) {
        if (config.verbosity > 1) {
          console.log('>>> Prepare %s: %s cache ...', ABBR, key);
        }

        await Fs.writeFile( bookPath, JSON.stringify( bookJson, null, 2 )+'\n' )
      }

    } else if (config.verbosity) {
      console.log('>>> Prepare %s: %s already cached', ABBR, key);
    }
  });

  await Promise.all( pending );

  if (config.returnVersion) {
    // Pass along cache location information
    version._cache = Object.assign( { prepare: config.outPath },
                                    version._cache || {} );
  }

  return (config.returnVersion ? version : config.outPath);
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Parse a single book.
 *
 *  @method _parseBook
 *  @param  abbrev        The book abbreviation {String};
 *  @param  chapters      The chapter data for this book {Object};
 *
 *  @return A simple object representing the given book {Object | undefined};
 *  @private
 */
function _parseBook( abbrev, chapters ) {
  const book    = Books.getBook( abbrev );
  // assert( book != null );

  const bkJson  = {
    metadata: [],
    chapters: {},
  };
  Object.entries( chapters ).forEach( ([chp, lines]) => {
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

      bkJson.chapters[ chp ] = _parseIntro( $, $intros );
      return;
    }

    /*********************************************************
     * Process this as a chapter with verses
     *
     */
    const firstUsfm = `${abbrev}.${chp}.1`;
    const $chaps    = $( '.chapter' ).children();
    bkJson.chapters[ chp ] = _parseChapter( $, $chaps, chp, book,
                                            firstUsfm );
  });

  // Validate the chapter count from the canonical data.
  const nonIntro    = Object.keys(bkJson.chapters).filter( name => {
                        return (! name.startsWith('INTRO') );
                      });
  const chapsFound  = nonIntro.length;
  const chapsExpect = Books.getChapters( book.abbr );
  if (chapsFound !== chapsExpect) {
    console.error('*** %s : %d identified chapters out of %d expected',
                  book.abbr, chapsFound, chapsExpect);
  }

  return bkJson;
}

/**
 *  Parse an introduction.
 *
 *  @method _parseIntro
 *  @param  $       The top-level Cheerio instance {Cheerio};
 *  @param  $intro  The intro element(s) {Cheerio};
 *
 *  @return A simple object representing the intro {Object};
 *  @private
 */
function _parseIntro( $, $intro ) {
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
 *
 *  @method _parseChapter
 *  @param  $           The top-level Cheerio instance {Cheerio};
 *  @param  $chap       The chapter element(s) {Cheerio};
 *  @param  chp         The number of the current chapter {Number};
 *  @param  book        Metadata about the target book {Book};
 *  @param  firstUsfm   The absolute reference for the first verse {String};
 *
 *  @return A simple object representing the chapter {Object};
 *  @private
 */
function _parseChapter( $, $chap, chp, book, firstUsfm ) {
  // The first 'label' will be used as the chapter label.
  const chJson  = {
    verse_count : 0,
    label       : null,
    verses      : {},
    fullText    : {},
  };

  /* Use a Map to merge all elements that comprise verses (.verse[data-usfm])
   * into arrays indexed by verse reference (data-usfm).
   *
   * Any non-verse metadata will be added to the previous "verse".
   */
  const verseState  = {
    $,

    firstUsfm : firstUsfm,
    curUsfm   : firstUsfm,
    verseMax  : 0,
    label     : null,

    verses    : new Map(),
    fullText  : new Map(),
    verse     : [],
  };

  verseState.verses.set( verseState.firstUsfm, verseState.verse );

  $chap.each( (jdex, el) => {
    /* Remember the "label" for this child element.
     *
     * We will use this to label any verse elements that are raw text so all
     * entries in 'verse' end up being objects with a markup type
     * (e.g.  label, p, li1).
     */
    const classes = _getClasses( el );
    const cls0    = (classes.length > 0 && classes.shift());

    verseState.label = (cls0 || el.type)
                     + (classes.length > 0
                          ? '.' + classes.join('.')
                          : '');

    /* Locate and process all 'verse' elements with a 'data-usfm' property
     * within this child.
     */
    const $verses = $(el).find('.verse[data-usfm]');

    if ($verses.length > 0) {
      $verses.each( (kdex, vs) => {
        // Check if there are non-verse siblings.
        const siblings  = $(vs).siblings(':not(.verse)');
        if (siblings.length > 0) {
          _addSiblingsToCurrentVerse( verseState, siblings );
        }

        _parseVerse( verseState, vs );
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

      /*
      console.log('label[ %s ], NO verses:', verseState.label, elJson);
      // */

      if (chJson.label == null && elJson.label != null) {
        // Use this label as the chapter label.
        chJson.label = elJson.label;

      } else {
        verseState.verse.push( elJson );
      }
    }
  });

  /* Perform one final round of inter-verse processing to deal with any
   * multi-verse entries at the end of a chapter.
   */
  _interVerseProcessing( verseState );

  // Validate the verse count from the canonical data.
  if (verseState.verseMax !== book.verses[ chp ]) {
    console.error('*** %s.%s : %d identified verses out of %d expected',
                  book.abbr, chp, verseState.verseMax, book.verses[ chp ]);
  }

  // Record the verse count
  chJson.verse_count = verseState.verseMax;

  /* Flatten our `verses` map into a simpler `verse` object within the
   * containing chapter, indexed by verse number.
   */
  verseState.verses.forEach( (verse, id) => {
    const [ bk, ch, vs ]  = id.split('.');
    let   text;

    if (verse.$ref == null) {
      // This is NOT a $ref verse so flatten the fullText for this verse
      let texts = verseState.fullText.get( id );

      if (! Array.isArray(texts)) {
        // Convert 'verse' to an array of text
        texts = verse.map( el => Object.values(el).join(' ') );

        console.warn('=== fullText[ %s ]: NOT an array:', id);
        console.warn('===   verse:', verse);
        console.warn('===   text :', texts);
      }

      text = texts.join(' ')
              .replaceAll(/\s+/g, ' ')
              .trim();
    }

    chJson.verses[ vs ]   = verse;
    chJson.fullText[ vs ] = text;
  });

  // Empty our maps
  verseState.verses.clear();
  verseState.fullText.clear();

  return chJson;
}

/**
 *  For the case where a paragraph contains a verse that is preceeded by
 *  non-verse siblings, we need to add that non-verse data to the previous
 *  verse content.
 *
 *  @method _addSiblingsToCurrentVerse
 *  @param  state           Processing state {Object};
 *  @param  state.$         The top-level Cheerio instance {Cheerio};
 *  @param  state.curUsfm   The absolute reference for the current verse
 *                          {String};
 *  @param  state.label     The parent label {String};
 *  @parm   state.verse     The current entry from `state.verses` references
 *                          via `state.curUsfm` {Array};
 *  @parm   state.fullText  The map of fullText by verse reference {Map};
 *  @param  siblings        The set of non-verse sibling element(s) {Cheerio};
 *
 *  @return An updated state {Object};
 *  @private
 */
function _addSiblingsToCurrentVerse( state, siblings ) {
  const curText = (state.fullText.get( state.curUsfm ) || []);

  /*
  console.log('>>> _addSiblingsToCurrentVerse(): %d siblings in %s to:',
              siblings.length, state.label, state.curUsfm);
  // */

  siblings.each( (idex, el) => {
    const json  = _parseEl( state.$, el );
    /*
    console.log('el[ %s ]:', typeof(json), json);
    // */

    if (typeof(json) === 'string') {
      // Push this text labeled with our parent label
      const text  = json.trim();
      if (text.length > 0) {
        state.verse.push( {[state.label]:json} );

        // Include the text
        curText.push( json )
      }

    } else {
      /* Push this item directly as verse data and extract and include any
       * verse-related text
       */
      const text  = _verseText( state.label, json );
      if (text) { curText.push( text ) }

      state.verse.push( json );
    }
  });

  state.fullText.set( state.curUsfm, curText );

  return state;
}

/**
 *  Parse a verse.
 *
 *  @method _parseVerse
 *  @param  state           Processing state {Object};
 *  @param  state.$         The top-level Cheerio instance {Cheerio};
 *  @param  state.firstUsfm The absolute reference for the first verse
 *                          {String};
 *  @param  state.curUsfm   The absolute reference for the current verse
 *                          {String};
 *  @param  state.maxVerse  The maximum verse number {Number};
 *  @param  state.label     The parent label {String};
 *  @parm   state.verses    The map of verses by verse reference {Map};
 *  @parm   state.fullText  The map of fullText by verse reference {Map};
 *  @parm   state.verse     The current entry from `state.verses` references
 *                          via `state.curUsfm` {Array};
 *  @param  elVerse         The verse element(s) {Cheerio};
 *
 *  @return An updated state {Object};
 *  @private
 */
function _parseVerse( state, elVerse) {
  const data_usfm = _getAttr( elVerse, 'data-usfm' );

  if (state.curUsfm !== data_usfm) {
    _interVerseProcessing( state );
  }

  state.curUsfm  = data_usfm;
  state.curMulti = data_usfm.split('+');

  /* Handle multi-verse references by storing them all in the first
   * verse.
   */
  const usfm  = state.curMulti[0];

  if (state.curMulti.length > 1) {
    /* Use the last verse in the range to update the maximum verse
     * number.
     */
    const last              = state.curMulti[ state.curMulti.length - 1 ];
    const [ _bk, _ch, _vs ] = last.split('.');

    state.verseMax = Math.max( state.verseMax, _vs );

    /*
    console.log('**** multi-verse reference[ %s ], last[ %s ], max[ %s ]',
                data_usfm, _vs, state.verseMax);
    // */

  } else {
    // Update the maximum verse
    const [ _bk, _ch, _vs ] = usfm.split('.');

    state.verseMax = Math.max( state.verseMax, _vs );
  }

  // Retrieve the target verse and fullText arrays
  let   verse   = (state.verses.get(   usfm ) || []);
  const curText = (state.fullText.get( usfm ) || []);

  if (! Array.isArray(verse) && verse.$ref != null) {
    console.warn('=== Multi-verse overlap @ %s:', usfm, verse);

    verse = [];
  }

  // Parse this verse into JSON form and retrieve the first key/value.
  const json  = _parseEl( state.$, elVerse );
  const key   = Object.keys( json ).shift();
  const val   = json[key];

  if (Array.isArray(val)) {
    // Process an array of verse elements
    val.forEach( item => {
      /*
      console.log('label[ %s ], key[ %s ], item:', state.label, key, item);
      // */

      const text  = _verseText( state.label, item );
      if (text) { curText.push( text ) }

      if (typeof(item) === 'string') {
        // Label this raw text with our parent label
        verse.push( {[state.label]:item} );

      } else {
        verse.push( item );
      }
    });

  } else {
    // Label this sub-item with our parent label
    /*
    console.log('label[ %s ], key[ %s ], val:', state.label, key, json[key]);
    // */

    const text  = _verseText( state.label, json[key] );
    if (text) { curText.push( text ) }

    verse.push( {[state.label]:json[key]} );
  }

  state.verse = verse;
  state.verses.set(   usfm, verse );
  state.fullText.set( usfm, curText );

  return state;
}

/**
 *  Handle any processing required between verses
 *  (e.g. filling in multi-verse references).
 *
 *  @method _interVerseProessing
 *  @param  state           Processing state {Object};
 *  @param  state.curMulti  The set of absolute reference(s) for the current
 *                          verse {String};
 *  @parm   state.verses    The map of verses by verse reference {Map};
 *
 *  @return The udpated state {Object};
 *  @private
 */
function _interVerseProcessing( state ) {
  if (state.curMulti && state.curMulti.length > 1) {
    const firstUsfm       = state.curMulti[0];
    const [ bk, ch, vs ]  = firstUsfm.split('.');
    const ref             = Refs.sortable( bk, ch, vs );

    /*
    console.warn('=== Fill in multi-verse references:');
    console.warn('===   ', state.curMulti);
    // */

    for (let idex = 1; idex < state.curMulti.length; idex++) {
      const usfm  = state.curMulti[ idex ];

      state.verses.set( usfm, { $ref: ref } );
    }
  }

  return state;
}

/**
 *  Given a label and object, extract verse-related text.
 *
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
 *
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
 *
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
 *
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
  version : prepare_version,
};
