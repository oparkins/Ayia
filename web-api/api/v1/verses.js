const parse = require('../parse');

/**
 *  Attach routes, initializing anything required to use them.
 *  @method attach
 *  @param  router  The target Express router {Router};
 *  @param  config  Top-level configuration/state {Object};
 *
 *  Routes:
 *    GET /api/v1/verses/:ref
 *      Fetch the references verse(s) where `:ref` has the form:
 *        VERS.BOOK[.chapter[.verse[-[.chapter].verse]]]
 *
 *        => 200    : { total: {Number}, verses:[ Verse, ... ] }
 *        => [45]xx : { error }
 */
function attach( router, config ) {
  // Attach routes
  router.get( '/verses/:ref', (req,res) => {
    _verses_get( config, req, res );
  });
}

/****************************************************************************
 * Private helpers {
 *
 */

/**
 *  Fetch verses.
 *  @method _verses_get
 *  @param  config  Top-level configuration/state {Object};
 *  @param  req     The incoming request {Request};
 *  @param  res     The outgoing response {Response};
 *
 *  @note Uses `req.params.ref` or `req.query.ref` to identify the target
 *        verse(s) as:
 *          VERS.BOOK[.chapter[.verse[-[.chapter].verse]]]
 *
 *  @return A promise for results {Promise};
 *  @private
 */
async function _verses_get( config, req, res ) {
  const $versions = config.mongodb.collections.versions;
  const refStr    = ( req.params.ref || req.query.ref );
  const ref       = parse.reference( refStr );
  const [
    vers,
    fr_book,
    fr_chap,
    fr_vers,
  ]               = ref.from.split('.');
  const [
    _vers,
    to_book,
    to_chap,
    to_vers,
  ]               = (ref.to 
                      ? ref.to.split('.')
                      : []);
  // assert( vers === _vers );

  // /*
  console.log('_verses_get( %s ): vers[ %s ], _vers[ %s ]',
              refStr, vers, _vers);
  console.log('_verses_get( %s ): fr_book[ %s ], fr_chap[ %s ], fr_vers[ %s ]',
              refStr, fr_book, fr_chap, fr_vers);
  console.log('_verses_get( %s ): to_book[ %s ], to_chap[ %s ], to_vers[ %s ]',
              refStr, to_book, to_chap, to_vers);
  // */

  /* :TODO: Fuzzy-match fr_book and to_book setting them to the
   *        canonical book abbreviations.
   */

  /**************************************************************************
   * 1. Locate the target version using the "from" reference;
   *
   */
  const VERS      = (vers && vers.toUpperCase());
  const json      = {
    total : -1,
    verses: [],
  };

  const versionQuery  = {
    $or: [
      {abbreviation      : VERS},
      {local_abbreviation: VERS},
    ],
  };
  const version = await $versions.findOne( versionQuery );

  if (version == null) {
    // Unknown version
    json.error = `Unknown version [ ${vers} ] in ref[ ${ref} ]`;
    res.status( 200 ).json( json );
    return;
  }

  /*
  console.log('_verses_get( %s ): vers[ %s ] => [ %s ]:',
              refStr, vers, version.abbreviation, ref);
  // */

  /**************************************************************************
   * 2. Pull verses from the "from" chapter depending on whether there is a
   *    "to" reference and whether it is in the same book/chapter;
   *
   */
  const col       = config.mongodb.db.collection( version.abbreviation );
  const queryFrom = {};
  let   verseBeg  = fr_vers;
  let   verseEnd;

  if (fr_vers != null && ref.to == null) {
    // Single verse
    queryFrom._id = `${fr_book}.${fr_chap}.${fr_vers}`;

  } else {
    // Verse range -- fetch all verses in the "from" chapter
    queryFrom._id = { $regex: new RegExp( `^${fr_book}.${fr_chap}` ) };

    if (to_book === fr_book && to_chap === fr_chap && to_vers != null) {
      verseEnd = to_vers;
    }
  }

  /*
  console.log('_verses_get( %s ): verseBeg[ %s ], verseEnd[ %s ]',
              refStr, verseBeg, verseEnd);
  // */

  const opts  = {
    sort: { _id: 1 }
  };
  const fromVerses  = await col.find( queryFrom, opts ).toArray();

  // Update totals and verses
  json.total  = fromVerses.length;
  json.verses = fromVerses.reduce( (obj,entry) => {
                  const id              = entry._id;
                  const [ bk, ch, vs ]  = id.split('.');
                  if (verseBeg && vs < verseBeg) { return obj }
                  if (verseEnd && vs > verseEnd) { return obj }

                  delete entry._id;

                  obj[ id ] = entry;
                  return obj;
                }, {});

  /**************************************************************************
   * 3. If there is a "to" reference and it is in a different book/chapter,
   *    pull verses from the "to" book/chapter;
   *
   */
  if (ref.to && (to_book !== fr_book || to_chap !== fr_chap)) {
    const queryTo = {
      _id: { $regex: new RegExp( `^${to_book}.${to_chap}` ) },
    };
    verseEnd = to_vers;

    const toVerses  = await col.find( queryTo, opts ).toArray();

    json.total += toVerses.length;
    toVerses.forEach( entry => {
      const id              = entry._id;
      const [ bk, ch, vs ]  = id.split('.');
      if (verseEnd && vs > verseEnd) { return }

      delete entry._id;

      json.verses[ id ] = entry;
    });
  }

  /*
  console.log('_verses_get( %s ):', refStr, _inspect(json));
  // */

  res.status( 200 )
    .json( json );
}

/*
function _inspect( obj ) {
  const Util  = require('util');
  const opts  = {
    showHidden      : false,
    depth           : 4,
    colors          : true,
    maxStringLength : 120,
    breakLength     : 80,
    compact         : 5,
  };

  return Util.inspect( obj, opts );
}
// */

/* Private helpers }
 ****************************************************************************/

module.exports = { attach };
