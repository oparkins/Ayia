const Refs  = require('../lib/refs');

/**
 *  Given a reference created via parse.reference(), generate the set of verse
 *  references represented by the given ref.
 *  @method verse_ids
 *  @param  ref   The reference generated via `parse.reference()` {Object};
 *                  { book: The book metadata {Object},
 *                            { abbr, verses:[ 0, vsCnt, ... ] }
 *                    from: { chapter, verse },
 *                    to  : { chapter, verse },
 *                  }
 *
 *  :NOTE: It is expected that `ref.book` includes an `id` that identifies the
 *         reference id of the target book.
 *
 *  @throws An error if `ref.book` is not provided.
 *
 *  @return The set of verse references {Array};
 */
function verse_ids( ref ) {
  const { book, from, to }  = ref;
  const ids                 = [];

  if (book == null) {
    throw new Error('verse_ids() requires a ref that includes book metadata');
  }

  // Fill in any missing verse/chapter values from the book metadata
  if (from.verse == null) {
    // Full chapter
    from.verse = 1;
    to.chapter = from.chapter;
    to.verse   = book.verses[ from.chapter ];
  }

  if (to.chapter == null)  { to.chapter = from.chapter }
  if (to.verse   == null)  { to.verse   = from.verse }

  // Apply max limits for chapters
  const maxChapter  = book.verses.length - 1;
  if (from.chapter > maxChapter) { from.chapter = maxChapter }
  if (to.chapter   > maxChapter) { to.chapter   = maxChapter }

  // Apply max limits for verses
  const maxFrom = book.verses[ from.chapter ];
  const maxTo   = book.verses[ to.chapter ];
  if (from.verse > maxFrom) { from.verse = maxFrom }
  if (to.verse   > maxTo)   { to.verse   = maxTo }

  /*
  console.log('verse_ids(): book:', book.abbr);
  console.log('verse_ids(): from:', from);
  console.log('verse_ids(): to  :', to);
  // */

  for (let ch = from.chapter; ch <= to.chapter; ch++) {
    const vsMax   = book.verses[ ch ];
    const vsFirst = (ch === from.chapter ? from.verse : 1);
    const vsLast  = (ch === to.chapter   ? to.verse   : vsMax);

    for (let vs = vsFirst; vs <= vsLast; vs++) {
      ids.push( Refs.sortable( book.abbr, ch, vs ) );
    }
  }

  return ids;
}

module.exports = { verse_ids };
