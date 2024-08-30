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
const Xrefs           = require('./xrefs');

/*
const { inspect }     = require('../../lib/inspect');
// */

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
     *
     * The `ar` for a 'note.x' item from YVERS will have the simple form:
     *    [
     *      { label },
     *      "text1",
     *      ...
     *    ]
     */
    const label = ar[0];
    const texts = ar.slice(1);
    const refs  = Xrefs.normalize( state, texts );
    const note  = [ label, ...refs ];
    /*
    console.log('_jsonElement(): %s: note.x with parsed refs:',
                state.usfm, inspect( note ));
    // */

    ar = note;

  } else if (label === 'note.f') {
    /* note.f elements MAY also contain references
     *
     * The `ar` for a 'note.f' item should be a set of object with tags like:
     *    label     The note label
     *    fr        Origin reference
     *    ft        Footnote text
     *    fq        Footnote quote
     *
     * We will normalize references from all `ft` elements.
     */
    const note  = [];

    ar.forEach( (item,idex) => {
      if (item.ft == null) {
        // Push this non-ft item and move on
        note.push( item );
        return;
      }

      const ft_ar = (Array.isArray( item.ft ) ? item.ft : [ item.ft ]);
      if (ft_ar.length < 1) {
        // Prune empty ft items
        return;
      }

      /* Process this footnote text.
       *
       * If there *are* cross-references in this text, they will be extracted
       * and a single `ft` item will become one or more `ft` items intermixed
       * with one or more `xt` items.
       */
      const res = Xrefs.normalize( state, ft_ar );

      if (res.length === 1 && typeof(res[0]) === 'string') {
        // No change
        note.push( item );

      } else {
        // Expanded with possible new xt items
        note.push( {ft: res} );
      }
    });

    /*
    console.log('_jsonElement(): %s: note.f with parsed refs:',
                state.usfm, inspect( note ));
    // */
    ar = note;
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
