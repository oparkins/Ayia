/**
 *  Generate a simple id for the given book, chapter, and verse.
 *  @method simple_ref
 *  @param  book          The name of the book {String};
 *  @param  chapter       The chapter id {Number | String};
 *  @param  [verse=null]  Optional verse id {Number | String};
 *
 *  These references have the form:
 *    BOK.c.v
 *
 *    e.g. MAT.1.3
 *
 *  @return The simple id {String};
 *  @private
 */
function simple_ref( book, chapter, verse=null ) {
  const ids = [ book, chapter ];

  if (verse != null) {
    ids.push( verse );
  }

  return ids.join('.');
}

/**
 *  Generate a sortable id for the given book, chapter, and verse.
 *  @method sortable_ref
 *  @param  book          The name of the book {String};
 *  @param  chapter       The chapter id {Number | String};
 *  @param  [verse=null]  Optional verse id {Number | String};
 *
 *  These references have the form:
 *    BOK.ccc.vvv
 *
 *    e.g. MAT.001.003
 *
 *  @return The sortable id {String};
 *  @private
 */
function sortable_ref( book, chapter, verse=null ) {
  const ids = [
    book,
    ref_num(chapter),
  ];

  if (verse != null) {
    ids.push( ref_num( verse ) );
  }

  return ids.join('.');
}

/**
 *  Generate a 3-digit, 0 padded version of the given value.
 *  @method ref_num
 *  @param  val     The target value {Number | String};
 *
 *  @return A 3-digit, 0 padded version of `val` {String};
 */
function ref_num( val ) {
  let num = val;

  if (typeof(val) === 'string') {
    num = parseInt( val );
  }

  if (Number.isNaN( num )) {
    //console.warn('ref_num( %s ): Invalid number for references', val);
    return val;
  }

  return String(num).padStart(3, '0');
}

module.exports = {
  simple  : simple_ref,
  sortable: sortable_ref,
  num     : ref_num,
};
