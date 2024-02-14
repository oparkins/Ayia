/**
 *  Given a reference created via parse.reference(), generate the set of verse
 *  references represented by the given ref.
 *  @method verse_ids
 *  @param  ref   The reference generated via `parse.reference()` {Object};
 *
 *  @return The set of verse references {Array};
 */
function verse_ids( ref ) {
  const { book, from, to }  = ref;
  const ids                 = [];

  if (book) {
    /* Given book information with verse ranges, fill in any missing
     * verse/chapter values.
     */
    if (from.verse == null) {
      // Full chapter
      from.verse = book[ from.chapter ].min;
      to.chapter = from.chapter;
      to.verse   = book[ from.chapter ].max;
    }

    if (to.chapter == null)  { to.chapter = from.chapter }
    if (to.verse   == null)  { to.verse   = from.verse }
  }

  /*
  console.log('verse_ids(): book:', book.id);
  console.log('verse_ids(): from:', from);
  console.log('verse_ids(): to  :', to);
  // */

  for (let ch = from.chapter; ch <= to.chapter; ch++) {
    const vsRange = book[ ch ];
    const vsFirst = (ch === from.chapter ? from.verse : vsRange.min);
    const vsLast  = (ch === to.chapter   ? to.verse   : vsRange.max);

    for (let vs = vsFirst; vs <= vsLast; vs++) {
      const vsRef = `${book.id}.${_ref_num(ch)}.${_ref_num(vs)}`;

      ids.push( vsRef );
    }
  }

  return ids;
}

/****************************************************************************
 * Private helpers {
 */

/**
 *  Generate a 3-digit, 0 padded version of the given value.
 *  @method _ref_num
 *  @param  val     The target value {Number | String};
 *
 *  @return A 3-digit, 0 padded version of `val` {String};
 *  @private
 */
function _ref_num( val ) {
  let num = val;

  if (typeof(val) === 'string') {
    num = parseInt( val );
  }

  if (Number.isNaN( num )) {
    console.warn('_ref_num( %s ): Invalid number for references', val);
    return null;
  }

  return String(num).padStart(3, '0');
}

/* Private helpers }
 ****************************************************************************/

module.exports = { verse_ids };
