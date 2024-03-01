/**
 *  Type-specific rendering engines.
 *
 */

/**
 *  Render raw HTML for the given item key/value where the value is an array or
 *  string.
 *
 *  @method html_raw
 *  @param  key The markup item key {String};
 *  @param  val The markup item value {String | Array};
 *
 *  Example:
 *    key:  'p'
 *    val:  "Jesus answered him, "
 *
 *    html:
 *      <span class='p'>Jesus answered him, </span>
 *
 *  Example:
 *    key: 'wj'
 *    val: [
 *            "“I assure you ",
 *            { it: "and" },
 *            " most solemnly say to you, unless a person is born again"
 *         ]
 *
 *    html:
 *      <span class='wj'>
 *        “I assure you
 *        <i>and</i>
 *        most solemnly say to you, unless a person is born again
 *      </span>
 *
 *  @return The rendered HTML {String};
 */
export function html_raw( key, val ) {
  const html  = [
    `<span class='${key}'>`,
  ];
  if (key === 'fq' || key === 'fqa') {
    // fq : Quotation from current scripture
    // fqa: Alternative Translation
    html.push( ` “` );
  }

  if (Array.isArray(val)) {
    // Flatten this array
    val.forEach( el => {
      if (typeof(el) === 'string') {
        html.push( el );
        return;
      }

      // Assume this is an object
      const i_key = Object.keys(el)[0];
      const i_val = el[i_key];

      switch( i_key ) {
        case 'it':  // italic
          html.push( `<i>${i_val}</i>` );
          break;

        default:
          html.push( `<span class='${i_key}'>${i_val}</span>` );
          break;
      }
    });

  } else {
    html.push( val );

  }

  if (key === 'fq' || key === 'fqa') {
    // fq : Quotation from current scripture
    // fqa: Alternative Translation
    html.push( `” ` );
  }
  html.push('</span>');

  return html.join('');
}
