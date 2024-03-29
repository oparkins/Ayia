const Books = require('../lib/books');

/**
 *  Parse a number from a request string.
 *
 *  @method parse_num
 *  @param  str   The request {String};
 *  @param  val   The default value {Number};
 *
 *  @return The parsed value {Number};
 */
function parse_num( str, val ) {
  let res = val;

  if (typeof(str) === 'string') {
    try {
      res = parseInt( str );

      if (Number.isNaN( res )) {
        res = val;
      }

    } catch(ex) {
      console.warn('parse_num( %s ): Invalid value, revert to[ %s ]:',
                    str, val, ex);
    }
  }

  return res;
}

/**
 *  Parse a sort request string.
 *
 *  @method parse_sort
 *  @param  str                 The sort request {String};
 *  @param  [sort = {_id:-1}]   The default sort value {Object};
 *
 *  @return The sort criteria {Object};
 *          { sort: { %field%: %direction% } }
 */
function parse_sort( str, sort = {_id:-1} ) {
  if (typeof(str) !== 'string') { return sort }

  str = decodeURIComponent( str );
  try {
    let [by,dir]  = str.split(/\s*:\s*/);

    if (by == null) {
      console.warn('parse_sort( %s ): Invalid value, revert to[ %s ]:',
                    str, JSON.stringify(sort), ex);

    } else {
      switch( dir ) {
        case 1:
        case '1':
        case '+1':
        case 'asc':
        case 'ASC':
          dir = +1;
          break;

        default:
          dir = -1;
          break;
      }

      sort = {
        [by]  : (dir == null ? -1 : dir),
      };
    }

  } catch(ex) {
    console.warn('parse_sort( %s ): Invalid value, revert to [ %s ]:',
                  str, JSON.stringify(sort), ex);
  }

  return sort;
}

/**
 *  Parse a sort order string.
 *
 *  @method parse_sort_order
 *  @param  str           The sort order (+1/asc, -1/desc) {String};
 *  @param  [order = +1]  The default sort order {Object};
 *
 *  @return The sort order {Number};
 */
function parse_sort_order( str, order = +1 ) {
  let res = order;

  if (typeof(str) !== 'string') { return res }

  str = decodeURIComponent( str );
  switch( str ) {
    case 1:
    case '1':
    case '+1':
    case 'asc':
    case 'ASC':
      res = +1;
      break;

    default:
      res = -1;
      break;
  }

  return res;
}

/**
 *  Parse an array filter string.
 *
 *  @method parse_array_filter
 *  @param  str             The array filter {String | Array};
 *  @param  [operator=null] If provided, force the logical operator (OR | AND),
 *                          otherwise for a string, check for [|,] to indicate
 *                          OR and [&+] to indicate AND
 *  {String};
 *
 *
 *  The filter string should have the form:
 *    val1|val2|val3    For OR searches  (or ',');
 *    val1+val2+val3    For AND searches (or '&');
 *
 *  @return The array filter {Object};
 */
function parse_array_filter( str, operator=null ) {
  let res = null;

  if (Array.isArray(str)) {
    if (operator === 'AND') {
      res = { '$all': str };

    } else {
      // OR
      res = { '$in': str };
    }

  } else if (typeof(str) == 'string') {
    str = decodeURIComponent( str );
    if (operator === 'OR' || str.includes('|') || str.includes(',')) {
      // OR [|,]
      const terms = str.split(/\s*[,|]\s*/);
      res = { '$in': terms };

    } else {
      // AND [&+]
      const terms = str.split(/\s*[&+]\s*/);
      res = { '$all': terms };
    }
  }

  return res;
}

/**
 *  Parse a date filter string.
 *
 *  @method parse_date_filter
 *  @param  str   The date filter {String};
 *
 *  The filter string should be an ISO date string of the form:
 *    YYYY-mm-dd
 *
 *  @return The date filter {Object};
 */
function parse_date_filter( str ) {
  const date  = new Date( str );
  let   res   = null;

  if (date.toString() === 'Invalid Date') { return res }

  res = { '$lte': date };

  return res;
}

/**
 *  Parse a search query for a string field.
 *
 *  @method parse_search
 *  @param  str             The search query {String};
 *  @param  [indexed=false] If true, generate an index-aware query {Boolean};
 *
 *  :NOTE:  If `indexeed`, the target field MUST be indexed:
 *            db.collection.createIndex( {field:'text'} );
 *
 *  @return The query filter {Object};
 */
function parse_search( str, indexed=false ) {
  let res = null;

  if (typeof(str) !== 'string') { return res }

  str = decodeURIComponent( str ).trim();
  if (indexed) {
    // index-aware query
    res = { '$text': { '$search' : str } };

  } else {
    // Non-index-aware query
    res = new RegExp( str, 'i' );
  }

  return res;
}

/**
 *  Parse a verse reference string.
 *  @method parse_ref
 *  @param  ref   The reference string {String};
 *                  BOOK[.chapter[.verse[-[.chapter].verse]]]
 *
 *  @return The parsed reference data or Error {Object | Error};
 *            {
 *              book: {     The book metadata {Object};
 *                abbr, name, order, loc, verses:[ 0, vsCnt, ... ],
 *              },
 *              from: {
 *                chapter:  The id of the starting chapter {Number};
 *                verse:    The id of the starting verse {Number};
 *              },
 *              to: {
 *                chapter:  The id of the ending chapter {Number};
 *                verse:    The id of the ending verse {Number};
 *              }
 *            }
 *  @private
 */
function parse_ref( ref ) {
  const [fromRange, toRange]  = ref.split(/\s*-\s*/);
  let [
    fromBook,
    fromChapter,
    fromVerse,
  ]                           = fromRange.split(/\s*\.\s*/);
  let toChapter;
  let toVerse;
  let book;
  const __convertNum  = (str) => {
    const num = parseInt( str );

    if (Number.isNaN( num )) {
      /*
      console.warn('parse_ref(): Invalid number for chapter/verse[ %s ]', str);
      // */
      return null;

    }

    return num; //String(num).padStart(3, '0');
  };

  /*************************************************************************
   * Process the portions of the `fromRange`
   *
   */
  if (typeof(fromBook) === 'string') { fromBook = fromBook.toUpperCase() }
  if (fromChapter != null) { fromChapter = __convertNum( fromChapter ) }
  if (fromVerse   != null) { fromVerse   = __convertNum( fromVerse ) }

  // Validate that we have all the required pieces for `from`
  if (fromBook    == null) { return new Error('missing book') }
  if (fromChapter == null) { return new Error('missing chapter (from)') }

  // Validate the target book
  book = Books.getBook( fromBook );
  if (book == null)  { return new Error(`Unknown book ${fromBook}`) }

  /*************************************************************************
   * Process the portions of any `toRange`
   *
   */
  if (toRange) {
    if (fromVerse   == null) { return new Error('missing verse (from)') }

    [ toChapter, toVerse ] = toRange.split(/\s*\.\s*/);

    if (toVerse == null) {
      // Shift
      toVerse   = toChapter;
      toChapter = null;
    }

    // Propagte from components to missing to components
    if (toChapter == null) { toChapter = fromChapter }
    else                   { toChapter = __convertNum( toChapter ) }

    if (toVerse   != null) {
      toVerse   = __convertNum( toVerse );
      if (toVerse == null) {
        return new Error(`invalid to range ${toRange}`);
      }
    }

    /* Ensure that from is before to as far as chapters and verses are
     * concerned.
     */
    if (fromChapter > toChapter) {
      // Swap chapter and verse
      [ fromChapter, toChapter ] = [ toChapter, fromChapter ];
      [ fromVerse,   toVerse ]   = [ toVerse,   fromVerse ];

    } else if (fromChapter === toChapter && fromVerse > toVerse) {
      // Swap verse
      [ fromVerse,   toVerse ]   = [ toVerse,   fromVerse ];
    }
  }

  if (book) {
    /* Given book information with verse ranges, fill in any missing
     * verse/chapter values.
     */
    if (fromVerse == null) {
      // Full chapter
      fromVerse = 1;
      toChapter = fromChapter;
      toVerse   = book.verses[ fromChapter ];
    }

    if (toChapter == null)  { toChapter = fromChapter }
    if (toVerse   == null)  { toVerse   = fromVerse }
  }

  /*************************************************************************
   * Generate the final `to` and `from` results
   *
   */
  const res = {
    book,

    from: { chapter: fromChapter, verse: fromVerse },
    to  : { chapter: toChapter,   verse: toVerse },
  };

  return res;
}

module.exports = {
  num         : parse_num,
  sort        : parse_sort,
  sort_order  : parse_sort_order,
  array_filter: parse_array_filter,
  date_filter : parse_date_filter,
  search      : parse_search,
  reference   : parse_ref,
};
