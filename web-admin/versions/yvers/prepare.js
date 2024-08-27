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

// /*
const { inspect }     = require('../../lib/inspect');
// */

/* Support various HTML dashes for separator
 *                  character   Unicode (hexadecimal)   HTML entity
 *  Hyphen          -           U+002d  (&#x0045);      -
 *  Unicode hyphen  ‐           U+2010  (&#x2010);      &dash; | &hyphen;
 *  Figure dash     ‒           U+2012  (&#x2012);
 *  En dash         –           U+2013  (&#x2013);      &ndash;
 *  Em dash         —           U+2014  (&#x2014);      &mdash;
 *  Horizontal bar  ―           U+2015  (&#x2015);      &horbar;
 *  minus sign      −           U+2212  (&#x2212);      &minus;
 */
const Dashes      =  [ '‐', '‒', '–', '—', '―', '\−', '\-' ];
const DashesRegex = new RegExp( `[${Dashes.join('')}]`, 'g' );

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
  if (version && version.books == null) {
    /* Missing 'books', likely due to being passed incomplete, top-level-only
     * version data. Force a pass through Extract to fill in 'books'.
     */
    config.vers = version.abbreviation;
    version = null;
  }

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
    // Exclude the raw 'books' and '_cache' from the version data we cache
    const json  = { ...version };
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

      const bookJson  = _parseBook( config, key, val );

      if (bookJson) {
        if (config.verbosity > 1) {
          console.log('>>> Prepare %s: %s cache ...', ABBR, key);
        }

        await Fs.writeFile( bookPath,
                            JSON.stringify( bookJson, null, 2 )+'\n' )
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
 *  @param  config                  Conversion configuration {Object};
 *  @param  config.version          If provided, extracted information for the
 *                                  target version (Yvers.extract.version()).
 *                                  If this is provided, `config.vers` may be
 *                                  omitted {Version};
 *  @param  [config.force = false]  If truthy, convert even if the output
 *                                  already exists {Boolean};
 *  @param  [config.verbosity = 0]  Verbosity level {Number};
 *  @param  abbrev                  The book abbreviation {String};
 *  @param  chapters                The chapter data for this book {Object};
 *
 *  @return A simple object representing the given book {Object | undefined};
 *  @private
 */
function _parseBook( config, abbrev, chapters ) {
  const book    = Books.getBook( abbrev );
  // assert( book != null );

  // Process all chapters for this book
  const book_map  = {};
  Object.entries( chapters ).forEach( ([chp, lines]) => {
    const $       = Cheerio.load( lines.join( '' ) );
    const $intros = $( '.intro' );

    /*
    console.log('chp %s: %d intros, %d chapter children ...',
                chp, $intros.length, $chaps.length);
    // */

    if ($intros.length > 0) {
      /*******************************************************
       * Process this as an introduction with no verses
       *
       */
      const usfm          = _getAttr( $intros[0], 'data-usfm' );
      const [bk, ch, vs]  = usfm.split('.');
      const ref           = Refs.sortable( bk, ch, vs );
      const intro         = _parseIntro( $, $intros );

      intro.text = intro.text.join(' ');

      book_map[ ref ] = intro;
      return;
    }

    /*********************************************************
     * Process this as a chapter with verses
     *
     */
    const $chapter  = $('.chapter');
    const usfm      = $chapter.attr('data-usfm');

    const state = {
      verbosity : config.verbosity,

      $         : $,
      book      : abbrev,
      label     : null,                     // The chapter label
      verses    : new Map(),
      verse     : { markup: [], text: [] }, // Current accumulating verse
      block     : null,                     // Current block
      key       : null,
      sub_key   : null,
      usfm      : `${usfm}.1`,
    };

    /* Inject a holder for the first verse, which will also hold all content
     * *up-to* the first verse.
     */
    state.verses.set( state.usfm, state.verse );

    // Process all block-level elements for this chapter
    $chapter.children().each( (idex, el) => {
      _parseBlock( state, el );
    });

    // Convert the verses map into a simple object
    for ( let [key,verse] of state.verses ) {
      const [bk, ch, vs]  = key.split('.');
      const ref           = Refs.sortable( bk, ch, vs );

      if (key !== `${bk}.${ch}.${vs}`) {
        /* Augment this verse with a multi-verse indicator, to be filled in
         * later.
         */
        verse._multi = key;
      }

      if (Array.isArray(verse.text)) {
        verse.text = verse.text.join(' ');
      }

      book_map[ ref ] = verse;

      //console.log('%s: %s', key, inspect( verse ));
    }
  });

  /* Finalize the book object by sorting keys and filling in any multi-verse
   * references.
   */
  const book_json = {};
  const refs      = Object.keys( book_map ).sort();
  const chaps     = new Set();  // Gather unique (non INTRO) chapters
  refs.forEach( ref => {
    const [bk,ch,vs]  = ref.split('.');
    const verse       = book_map[ ref ];

    if (ch && ! ch.startsWith('INTRO')) {
      chaps.add( ch );
    }

    if (book_json.hasOwnProperty( ref )) {
      /* Multi-verse collision. Typically a verse that has been split into
       * parts, e.g. MSG John 3:27-29a ; 3:29b-30
       *
       * Over-write the reference with verse content.
       */
      if (config.verbosity) {
        console.log('=== Prepare %s: Verse overlap at %s:',
                    abbrev, ref, book_json[ref]);
      }
    }

    book_json[ ref ] = verse;

    if (verse._multi) {
      _addMultiverseRefs( ref, verse._multi, book_json,
                          abbrev, config.verbosity );
      delete verse._multi;
    }
  });

  /***********************************************************
   * Validate the chapter count from the canonical data.
   *
   */
  const chapsFound  = chaps.size;
  const chapsExpect = Books.getChapters( book.abbr );
  if (chapsFound !== chapsExpect) {
    console.error('*** %s : %d identified chapters out of %d expected',
                  book.abbr, chapsFound, chapsExpect);
  }

  return book_json;
}

/**
 *  Parse an introduction.
 *
 *  @method _parseIntro
 *  @param  $         The top-level Cheerio instance {Cheerio};
 *  @param  $intro    The intro element(s) {Cheerio};
 *
 *  @return A simple object representing the intro {Object};
 *  @private
 */
function _parseIntro( $, $intro ) {
  const introJson = {
    markup  : [],
    text    : [],
  };
  const state     = { $ };

  $intro.children().each( (jdex, el) => {
    const json  = _jsonElement( state, el );
    const text  = $(el).text().trim();

    /*
    console.log('-- intro %s: %d:', chp, jdex, json);
    // */

    introJson.markup.push( json );
    introJson.text.push( text );
  });

  return introJson;
}

/**
 *  Parse a block-level element.
 *
 *  @method _parseBlock
 *  @param  state           Chapter processing state {Object};
 *  @param  state.verbosity Verbosity level {Number};
 *  @param  state.$         The top-level Cheerio instance {Cheerio};
 *  @param  state.book      The book abbreviation {String};
 *  @param  state.label     The chapter label {String};
 *  @param  state.verses    A map of verses {Map};
 *  @param  state.verse     The current accumulating verse {Array};
 *  @param  state.block     The current block {String};
 *  @param  state.key       The key under which to gather content {String};
 *  @param  state.sub_key   The sub-key beneath `key` {String};
 *  @param  state.usfm      The reference of the current verse {String};
 *  @param  el              The target HTML element {Object};
 *
 *  @return The updated `state` {Object};
 *  @private
 */
function _parseBlock( state, el ) {
  const $         = state.$;
  const $el       = $(el);
  const classes   = _getClasses( el );
  const cls0      = (classes.length > 0 && classes[0]);
  const block     = (cls0 || el.name);
  const children  = $el.children();

  // assert( children.length > 0 )

  if (block === 'label') {
    // Chapter label -- skip this block
    if (state.label == null) {
      state.label = $el.text().trim();

      /*
      console.log('=====================================================');
      console.log('=== Chapter label[ %s ]', state.label);
      // */

    } else {
      console.warn('=== Multiple chapter labels current[ %s ], new[ %s ]',
                    state.label, $el.text());
    }

    return state;
  }

  // New block
  state.block = block;
  state.key   = `#${state.block}`;

  const $children = $el.children();

  if (block === 'table') {
    _parseTable( state, el );

  } else if ($children.length < 1) {
    // Empty block element

    //console.log('_parseBlock(): %s -- NO children', classes.join('.'));
    state.verse.markup.push( { [state.key]: null } );

  } else {
    // Parse all block children
    $children.each( (jdex, ch) => {
      _parseChar( state, ch );
    });
  }

  return state;
}

/**
 *  Parse a table element.
 *
 *  @method _parseTable
 *  @param  state           Chapter processing state {Object};
 *  @param  state.verbosity Verbosity level {Number};
 *  @param  state.$         The top-level Cheerio instance {Cheerio};
 *  @param  state.book      The book abbreviation {String};
 *  @param  state.label     The chapter label {String};
 *  @param  state.verses    A map of verses {Map};
 *  @param  state.verse     The current accumulating verse {Array};
 *  @param  state.block     The current block {String};
 *  @param  state.key       The key under which to gather content {String};
 *  @param  state.sub_key   The sub-key beneath `key` {String};
 *  @param  state.usfm      The reference of the current verse {String};
 *  @param  el              The target HTML element {Object};
 *
 *  Handle 'table' blocks
 *    <table class='table'>
 *      <tr class='row'>
 *        <td class='cell'>
 *          -- Block-like processing, taking into account row and cell
 *          -- boundaries
 *        </td>
 *        ...
 *      </tr>
 *      ...
 *    </table>
 *
 *  @return The updated `state` {Object};
 *  @private
 */
function _parseTable( state, el ) {
  const $       = state.$;
  const $el     = $(el);
  const $rows   = $el.find('.row');

  /*
  console.log('_parseTable: %d rows ...', $rows.length);
  // */

  $rows.each( (rdex, row) => {
    // assert( _getClasses( row ) == [ 'row' ] )
    const $cells  = $(row).find('.cell');

    $cells.each( (cdex, cell) => {
      // assert( _getClasses( cell ) == [ 'cell' ] )
      const children = cell.children || [];

      state.block = `row:${rdex}.${cdex}`;
      state.key   = (cdex === 0 ? '#' : '+')
                  + state.block;

      if (children.length < 1) {
        // Empty cell
        state.verse.markup.push( { [state.key]: null } );

      } else {
        // Parse all block children
        children.forEach( (ch) => {
          _parseChar( state, ch );
        });
      }
    });
  });;

  return state;
}

/**
 *  Parse a character element.
 *
 *  @method _parseChar
 *  @param  state           Chapter processing state {Object};
 *  @param  state.verbosity Verbosity level {Number};
 *  @param  state.$         The top-level Cheerio instance {Cheerio};
 *  @param  state.book      The book abbreviation {String};
 *  @param  state.label     The chapter label {String};
 *  @param  state.verses    A map of verses {Map};
 *  @param  state.verse     The current accumulating verse {Array};
 *  @param  state.block     The current block {String};
 *  @param  state.key       The key under which to gather content {String};
 *  @param  state.sub_key   The sub-key beneath `key` {String};
 *  @param  state.usfm      The reference of the current verse {String};
 *  @param  el              The target HTML element {Object};
 *  @param  [depth=1]       The recursion depth {Number};
 *
 *  @return The updated `state` {Object};
 *  @private
 */
function _parseChar( state, el, depth=1 ) {
  const $         = state.$;
  const classes   = _getClasses( el );
  const cls0      = (classes.length > 0 && classes[0]);
  const children  = el.children || [];

  if (children.length < 1) {
    // No children -- process this leaf eleemnt
    _parseLeaf( state, el, depth );
    state.sub_key = null;
    return state;
  }

  const usfm  = _getAttr( el, 'data-usfm' );
  if (usfm) {
    // This element has a 'data-usfm' attribute and so is related to a verse.
    // assert( cls0 === 'verse' );
    state.usfm = usfm;

    if (! state.verses.has( usfm )) {
      /*
      console.log('-----------------------------------------------------');
      console.log('=== Verse [ %s.%s.%s ], depth[ %d ], usfm[ %s ] ...',
                  state.block, state.key, cls0, depth, usfm);
      // */

      state.verse = {
        markup: [],
        text  : [],
      };
      state.verses.set( usfm, state.verse );

    } else {
      state.verse = state.verses.get( usfm );

      /*
      console.log('+++ Verse [ %s.%s.%s ], depth[ %d ], usfm[ %s ] ...',
                  state.block, state.key, cls0, depth, usfm);
      // */

    }
  }

  /* IF this is a `verse` element, gather the ENTIRE element tree for direct
   * inclusion.
   */
  const isVerse = (cls0 === 'verse');

  if (isVerse) {
    /* The full JSON will be { verse.v#: [ ... ] }
     *
     * We only need the first value (array) associated with our current `key`
     */
    const fullJson  = _jsonElement( state, el );
    const firstVal  = Object.values( fullJson )[0];

    // assert( Array.isArray( firstVal ) );

    if (firstVal.length < 1) {
      /* Skip this empty block to postpone the conversion of any block element
       * from first to continued. Let that occur with the next non-empty block.
       */
      return;

    }

    // Include the full sub-tree directly under the current key
    state.verse.markup.push( { [state.key]: firstVal } );

    // Gather the text of all children that are NOT 'label' or 'note'
    _gatherText( state, el );

    /* Update the primary key to indicate a block continuation and
     * remove this (consumed) sub_key
     */
    state.key = '+'+ state.key.slice(1);
    state.sub_key = null;
    return state;
  }

  if (cls0 === 'note') {
    /* Include notes directly -- this is likely a note within a non-verse
     * element (e.g. chapter heading).
     */
    const note    = _jsonElement( state, el );

    /*
    console.log('=== block [ %s.%s.%s ], depth[ %d ]: note:',
                state.block, state.key, state.sub_key, depth,
                inspect( note ));
    // */

    state.verse.markup.push( { [state.key]: note } );
    return;
  }

  /*************************************************************
   * For non-verse blocks, recursively parse all children,
   * placing them within the current key.
   */
  state.sub_key = cls0;

  /*
  console.log('+++ block [ %s.%s.%s ], depth[ %d ]:',
              state.block, state.key, state.sub_key, depth,
              $(el).html());
  // */

  children.forEach( (ch, jdex) => {
    _parseChar( state, ch, depth+1 );
  });

  return state;
}

/**
 *  Parse a leaf element.
 *
 *  @method _parseLeaf
 *  @param  state           Chapter processing state {Object};
 *  @param  state.verbosity Verbosity level {Number};
 *  @param  state.$         The top-level Cheerio instance {Cheerio};
 *  @param  state.book      The book abbreviation {String};
 *  @param  state.label     The chapter label {String};
 *  @param  state.verses    A map of verses {Map};
 *  @param  state.verse     The current accumulating verse {Array};
 *  @param  state.block     The current block {String};
 *  @param  state.key       The key under which to gather content {String};
 *  @param  state.sub_key   The sub-key beneath `key` {String};
 *  @param  state.usfm      The reference of the current verse {String};
 *  @param  el              The target HTML element {Object};
 *  @param  depth           The recursion depth {Number};
 *
 *  @return The updated `state` {Object};
 *  @private
 */
function _parseLeaf( state, el, depth ) {
  const $     = state.$;
  const $el   = $(el);
  const text  = $el.text().trim();

  /*
  console.log('_parseLeaf(): block [ %s.%s.%s ], depth[ %d ], text[ %s ]',
              state.block, state.key, state.sub_key, depth, text);
  // */

  if (text.length < 1) {
    // No text -- Allow for tags that are MAY be empty, otherwise, skip.
    if (state.key === 'b' || state.key === 'nb') {
      state.verse.markup.push( { [state.key]: null } );

    }
    return state;
  }

  if (state.sub_key === 'label') {
    // Verse label
    const key = `${state.key}.v`;

    //console.log('===== push: { %s: %s }', key, text );
    state.verse.markup.push( { [key]: text } );

  } else {
    state.verse.markup.push( { [state.key]: text } );

    if (state.sub_key === 'content') {
      // Include this content in the full text
      state.verse.text.push( text );

      /*
    } else {
      console.log('===== block[ %s.%s.%s], Exclude text[ %s ]',
                  state.block, state.key, state.sub_key, text );
      // */
    }
  }

  /* Update the primary key to indicate a block continuation and
   * remove this (consumed) sub_key
   */
  state.key = '+'+ state.key.slice(1);
  state.sub_key = null;

  return state;
}

/**
 *  Gather text from this element from all children that are not 'label' or
 *  'note' character blocks.
 *
 *  @method _gatherText
 *  @param  state         Chapter processing state {Object};
 *  @param  state.$       The top-level Cheerio instance {Cheerio};
 *  @param  state.verse   The current accumulating verse {Array};
 *  @param  el            The target HTML element {Object};
 *
 *  @return void
 *  @private
 */
function _gatherText( state, el ) {
  const $     = state.$;
  const $el   = $(el);

  el.children.forEach( child => {
    const classes = _getClasses( child );
    const cls0    = (classes.length > 0 && classes.shift());

    // Skip 'label', 'header', and 'note' children
    if (cls0 === 'label' || cls0 === 'header' || cls0 === 'note') { return }

    const text  = $(child).text().trim();
    if (text.length < 1) { return }

    state.verse.text.push( text );
  });

  return;
}

/**
 *  Fill in back-references for multi-verse entries.
 *
 *  @method _addMultiverseRefs
 *  @param  ref         The reference for the multi-verse fills {String};
 *  @param  multi       The multi-verse reference {String};
 *  @param  book_json   The accumulating book object into which references
 *                      should be added {Object};
 *  @param  abbrev      The book abbreviation (for debug output) {String};
 *  @param  verbosity   Verbosity level {Number};
 *
 *  @return The updated `book_json` {Object};
 *  @private
 */
function _addMultiverseRefs( ref, multi, book_json, abbrev, verbosity ) {
  const usfms = multi.split('+');

  usfms.forEach( (usfm) => {
    const [ bk, ch, vs ]  = usfm.split('.');
    const thisRef         = Refs.sortable( bk, ch, vs );
    if (thisRef === ref) { return }

    // Generate a back-reference to the full verse
    const backRef = { _ref: ref };

    if (verbosity > 1) {
      console.log('=== Prepare %s: Multi-verse[ %s ]: add ref @ %s:',
                  abbrev, multi, thisRef, backRef);
    }

    book_json[ thisRef ] = backRef;
  });

  return book_json;
}

/**
 *  Convert the given element to pure JSON.
 *
 *  @method _jsonElement
 *  @param  state           Chapter processing state {Object};
 *  @param  state.verbosity Verbosity level {Number};
 *  @param  state.$         The top-level Cheerio instance {Cheerio};
 *  @param  state.book      The book abbreviation {String};
 *  @param  state.label     The chapter label {String};
 *  @param  state.verses    A map of verses {Map};
 *  @param  state.verse     The current accumulating verse {Array};
 *  @param  state.block     The current block {String};
 *  @param  state.key       The key under which to gather content {String};
 *  @param  state.sub_key   The sub-key beneath `key` {String};
 *  @param  state.usfm      The reference of the current verse {String};
 *  @param  el              The current element {Element};
 *  @param  [depth=1]
 *
 *  @return The final object {Object};
 *  @private
 */
function _jsonElement( state, el, depth=1 ) {
  const classes   = _getClasses( el );
  const cls0      = (classes.length > 0 && classes.shift());
  const $el       = state.$(el);
  const label     = (cls0 || el.type)
                  + (classes.length > 0
                        ? '.' + classes.join('.')
                        : '');
  const children  = el.children || [];  //$el.children();
  let   json;

  // Flatten elements that are 'content' or 'heading'
  if (label === 'content') {
    return $el.text().trim();
  }
 /* A heading MAY contain a note, e.g. NIV.PSA.003
  if (label === 'heading') {
    return $el.text().trim();
  }
  // */

  if (children.length < 1) {
    // NO children
    if (label === 'text' || label === 'heading') {
      // JUST a text node so no need for a 'text' label
      json = $el.text().trim();

    } else {
      json = {
        [label]: $el.text().trim(),
      };
    }
    return json;
  }

  // Recursively parse all children
  let ar  = [];
  children.forEach( (ch, jdex) => {
    const chJson  = _jsonElement( state, ch, depth+1 );
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

  if (label === 'note.x') {
    /* Perform additional processing of reference notes to convert the
     * free-text references to a normalized form.
     */
    const label = ar[0];
    const texts = ar.slice(1);
    const refs  = _normalizeXrefs( state, texts );

    /*
    console.log('_jsonElement(): %s: note.x refs:',
                state.usfm, inspect( refs ));
    // */

    const note  = [ label, ...refs ];

    ar = note;

  } else if (label === 'note.f') {
    /* note.f elements MAY also contain references in the
     *        `ft` element
     */
    const idex  = ar.findIndex( item => Object.keys(item).includes('ft') );

    if ( idex >= 0 ) {
      const ar_ft = (Array.isArray( ar[idex] ) ? ar[idex] : [ ar[idex] ]);
      const res   = _extractFootnoteRefs( state, ar_ft );

      if (res.length === 1) { ar[ idex ] = res[0] }
      else                  { ar[ idex ] = res }
    }
  }

  return {
    [label]: ar,
  };
}

/**
 *  Given an array of cross-reference text, return a normalized version of each
 *  reference.
 *
 *  @method _normalizeXrefs
 *  @param  state           Chapter processing state {Object};
 *  @param  state.verbosity Verbosity level {Number};
 *  @param  state.$         The top-level Cheerio instance {Cheerio};
 *  @param  state.book      The book abbreviation {String};
 *  @param  state.label     The chapter label {String};
 *  @param  state.verses    A map of verses {Map};
 *  @param  state.verse     The current accumulating verse {Array};
 *  @param  state.block     The current block {String};
 *  @param  state.key       The key under which to gather content {String};
 *  @param  state.sub_key   The sub-key beneath `key` {String};
 *  @param  state.usfm      The reference of the current verse {String};
 *  @param  texts           The set of cross-reference text(s) {Array[String]};
 *
 *  @return The set of texts along with new `refs` elements containing any
 *          normalized references for the preceeding text item {Array};
 *            [ text,
 *              {xt: { text, ref }},
 *              text,
 *              {xt: { text, ref }},
 *              ...
 *            ]
 *  @private
 */
function _normalizeXrefs( state, texts ) {
  const loc                               = state.usfm;
  let   [ cur_book, cur_chap, cur_vers ]  = loc.split('.');
  const norm                              = [];
  let   prv_book;

  /* Examples:
   *  CEV 1CH.2.7
   *    [ 'Js 7.1.' ]
   *
   *  CEV 1CH.5.1
   *    [ 'Gn 35.22; 49.3,4.' ]
   *
   *  CEV 1CH.3.5
   *    [ '2 S 11.2-4.' ]
   *
   *  CEV 2CH.34.5
   *    [ '1 K 13.2.' ]
   *
   *  CEV 2CH.35.4
   *    [ '2 Ch 8.14.' ]
   */
  texts.forEach( (text, tdex) => {
    if (typeof(text) !== 'string') {
      /*
      console.log('=== _normalizeXrefs():%s: text #%d NOT a string:',
                  loc, tdex, text);
      // */
      return;
    }

    /* Clean-up the text and then split it into potential reference items.
     *
     */
    const items = text
                      /* Handle cases where references are NOT delimited by ;
                       *  e.g. HCSB: HAB.2.5:
                       *        Is 13:4; 43:9 66:18; Jr 3:17; Hs 10:10; ...
                       *                     ^
                       *       HCSB: JOB.9.4:
                       *        Jb 11:6; 12:13: 36:5
                       *                      ^
                       */
                      .replace(/([0-9]):?\s+([0-9])/, '$1;$2')
                      // Remove '.' from the end of the string
                      /* Space out 'for' when immediately followed by a
                       * reference.
                       */
                      .replace(/for([0-9:]+)/gi, 'For $1')
                      /* :XXX: Do NOT normalize dashes here.
                       *       Explicit cross-references seem to use
                       *       a long-dash (e.g. &mdash;) to identify ranges
                       *       that cross chapter boundaries. These we do NOT
                       *       want to treat as a range since we don't support
                       *       cross-chapter ranges.
                       */
                      // Finally, split on separators (,;)
                      .split(/\s*[,;]\s*/);

    let firstRef  = true;
    items.forEach( (item,idex) => {
      /* Cleanup the item text
       *                First, remove unneeded text */
      const norm_item = item.replace(
                          /\s*(Cited( from)?|See|cp|gk|above|below|with)\s*/gi,
                          '')
                      // Remove all braces and parens
                      .replace(/\s*[\[\(\)\]]\s*/g, '')
                      // Remove '.' from the end of the string
                      .replace(/\s*\.\s*$/, '')
                      // Remove '.' as a book abbreviation
                      .replace(/([a-z])\.\s+/gi, '$1 ');

      /* For ...            : Multiverse cross-reference (applies to multiple
       *                      verses)
       * [0-9]+             : Verse
       * [0-9]+:[0-9]+      : Chapter/Verse
       *
       * Book [0-9]+:[0-9]+ : Book/chapter/verse
       */
      const isFor       = (norm_item.startsWith('For '));
      const isCh        = (norm_item.startsWith('ch'));
      const isVer       = (norm_item.startsWith('ver'));
      const hasBook     = (!isCh && !isVer && norm_item.indexOf(' ') >= 0);
      const hasChapter  = (norm_item.indexOf(':') > 0 ||
                           norm_item.indexOf('.') > 0);
      const hasRange    = (norm_item.indexOf('-') > 0);
      let   ref;

      /*
      console.log('_normalizeXrefs(): loc[ %s ] #%d: item[ %s ], norm[ %s ]',
                  loc, idex, item, norm_item);
      // */

      if (isFor) {
        ref = null;

      } else if (hasBook) {
        const parts = norm_item.split(/[ :.]/);

        let [ book, chap, vers ]  = parts;
        if (book.length < 3 && book[0] >= '1' && book[0] <= '3') {
          // This is a numbered book
          book = `${parts[0]} ${parts[1]}`;
          chap = parts[2];
          vers = parts[3];
        }

        book = book.replace(/[^A-Za-z0-9 ]+/g, '');

        const abbr  = Books.nameToABBR( book );

        if (abbr == null) {
          // /*
          console.log('*** _normalizeXrefs():%s: note.x[ %s ], norm[ %s ]: '
                        +       'Cannot identify book[ %s ]',
                        loc, item, norm_item, book);
          // */

        } else {
          cur_book = abbr;
          cur_chap = chap;
          cur_vers = vers;

          ref = Refs.sortable( cur_book, cur_chap, cur_vers );
        }


      } else if (hasChapter) {
        [ cur_chap, cur_vers ]  = norm_item.replace(/^ch[a-z.]*\s+/, '')
                                      .split(/[:.]/);

        ref = Refs.sortable( cur_book, cur_chap, cur_vers );

      } else {
        cur_vers = norm_item.replace(/^ver[a-z.]*\s+/, '');

        ref = Refs.sortable( cur_book, cur_chap, cur_vers );

      }

      if (ref) {
        // Add a new reference
        if (firstRef) {
          firstRef = false;
        } else {
          // Include a separator character
          if (cur_book === prv_book)  { norm.push(', ') }
          else                        { norm.push('; ') }
        }

        if (hasRange && cur_vers) {
          /* Update the reference with the end of a verse range
           * (ignore chapter ranges)
           */
          const [ fr, to ]  = cur_vers.split(/\s*-\s*/);

          if (to != null) {
            const to_num  = Refs.num( to );

            ref = `${ref}-${to_num}`;
          }
        }

        const record  = {
          xt: {
            text  : item,
            ref   : ref,
          }
        };

        /*
        console.log('_normalizeXrefs():%s: note.x[ %s ], norm[ %s ] ...',
                    loc, item, norm_item);
        console.log('    new book[ %s ], chap[ %s ], vers[ %s ] ...',
                    cur_book, cur_chap, cur_vers);
        console.log('    ref:', inspect(record));
        // */

        norm.push( record );

      } else {
        norm.push( item );

      }

      prv_book = cur_book;
    });
  });

  /*
  console.log('_normalizeXrefs():%s:', loc);
  console.log('    texts:', inspect( texts ));
  console.log('    norm :', inspect( norm ));
  // */

  return norm;
}

/**
 *  Given an array of footnote text, locate and normalize any cross-references.
 *
 *  @method _extractFootnoteRefs
 *  @param  state           Chapter processing state {Object};
 *  @param  state.verbosity Verbosity level {Number};
 *  @param  state.$         The top-level Cheerio instance {Cheerio};
 *  @param  state.book      The book abbreviation {String};
 *  @param  state.label     The chapter label {String};
 *  @param  state.verses    A map of verses {Map};
 *  @param  state.verse     The current accumulating verse {Array};
 *  @param  state.block     The current block {String};
 *  @param  state.key       The key under which to gather content {String};
 *  @param  state.sub_key   The sub-key beneath `key` {String};
 *  @param  state.usfm      The reference of the current verse {String};
 *  @param  texts           The set of footnote text(s) {Array[String]};
 *
 *  @return The set of texts along with new `refs` elements containing any
 *          normalized references for the preceeding text item {Array};
 *            [ text,
 *              {xt: { text, ref }},
 *              text,
 *              {xt: { text, ref }},
 *              ...
 *            ]
 *  @private
 */
function _extractFootnoteRefs( state, texts ) {
  const loc                               = state.usfm;
  let   [ cur_book, cur_chap, cur_vers ]  = loc.split('.');
  const norm                              = [];

  /* :TODO: Extract and normalize any references
   *
   *  Examples:
   *    AMP: 1CH.1.6
   *      [ 'In Gen 10:3', { it: 'Riphath' }, '.' ]
   *
   *    AMP: GEN.32.24
   *      [ 'This was God Himself (as Jacob eventually realizes in
   *         Gen 32:30; see also v 29 and Hosea 12:4),
   *         in the form of an angel.' ]
   *
   *    AMP: GEN.36.12
   *      [ 'See note 22:24.' ]
   *
   *    AMP: GEN.36.39
   *      [ 'In 1 Chr 1:50, Hadad.' ]
   *
   *    AMP: GEN.37.23
   *      [ 'See note v 3.' ]
   *
   *    AMP: GEN.40.19
   *      [ 'Notice the totally different usage of the words
   *        “lift up your head.” In v 13, it is used idiomatically
   *        as “present you i...' ]
   *
   *    AMP: GEN.42.7
   *      [ 'Joseph was conversing with his brothers through an interpreter
   *        (v 23).' ]
   *
   *    AMP: HAG.1.2
   *      [ 'The people of Judah had completed seventy years of captivity in
   *         Babylon (Jer 25:11, 12; Dan 9:2). In October 539',
   *        { sc: 'b' },
   *        '.',
   *        { sc: 'c' },
   *        '., the Medes and Persians conquered Babylon, whereupon Cyrus the
   *         Great (founder of the Persian Empire, his reign extende ...',
   *        { sc: 'b' },
   *        '.',
   *        { sc: 'c' },
   *        '.) issued a decree permitting the Jews to return home and
   *         mandating the rebuilding of the temple (Ezra 1:1-4).
   *         Some 50,0 ...',
   *        { sc: 'b' },
   *        '.',
   *        { sc: 'c' },
   *        '.'
   *      ]
   *
   *  ---
   *    CEV 2CH.34.20
   *      [ 'Also called “Achbor son of Micaiah” (see 2 Kings 22.12).' ]
   *
   *    CEV 2CH.34.30
   *      [ "The Hebrew text has “The Book of God's Agreement,” which is the
   *         same as “The Book of God's Law” in verses 15 and 19. In ..." ]
   *
   *    CEV 2CH.35.1
   *      [ 'See the note at 29.3.' ]
   *
   *  ---
   *    HCSB: HOS.4.18
   *      [ 'Lit Her shields ; Ps 47:9; 89:18' ]
   *
   *    HCSB: HOS.11.12
   *      [ 'Hs 12:1 in Hb' ]
   *
   *  ---
   *    NASB1995: 1KI.4.26
   *      [ 'One ms reads', { it: '4000,' }, 'cf 2 Chr 9:25' ]
   *
   *  ---
   *    NIV11: 1CH.1.6
   *      [ 'Many Hebrew manuscripts and Vulgate
   *         (see also Septuagint and Gen. 10:3); most Hebrew manuscripts' ]
   *
   *    NIV11: 1CH.1.17
   *      [ 'One Hebrew manuscript and some Septuagint manuscripts
   *         (see also Gen. 10:23); most Hebrew manuscripts do not have this
   *         line.' ]
   *
   *    NIV11: 1CH.1.42
   *      [ 'See Gen. 36:28; Hebrew' ]
   *
   *    NIV11: 1CH.3.6
   *      [ 'Two Hebrew manuscripts (see also 2 Samuel 5:15 and 1 Chron. 14:5);
   *         most Hebrew manuscripts' ]
   *
   *    NIV11: 1CH.6.77
   *      [ 'See Septuagint and Joshua 21:34; Hebrew does not have' ]
   *
   *    NIV11: 1CH.8.30
   *      [ 'Some Septuagint manuscripts (see also 9:36);
   *         Hebrew does not have' ]
   *
   *    NIV11: EZR.7.26
   *      [ 'The text of 7:12-26 is in Aramaic.' ]
   *
   *    NIV11: EZR.8.10
   *      [ 'Some Septuagint manuscripts (also 1 Esdras 8:36);
   *         Hebrew does not have' ]
   *
   *    NIV11: GAL.3.8
   *      [ 'Gen. 12:3; 18:18; 22:18' ]
   *
   *    NIV11: HEB.1.12
   *      [ 'Psalm 102:25-27' ]
   *
   *    NIV11: HEB.3.15
   *      [ 'Psalm 95:7,8' ]
   *
   *    NIV11: HEB.4.3
   *      [ 'Psalm 95:11; also in verse 5' ]
   *
   *    NIV11: HEB.10.30
   *      [ 'Deut. 32:36; Psalm 135:14' ]
   *
   *    NIV11: HEB.12.21
   *      [ 'See Deut. 9:19.' ]
   *
   */

  /*
  console.log('_extraFootnoteRefs(): %s:',
              state.usfm, inspect( texts ));
  // */

  return texts;
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
