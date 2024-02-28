/**
 *  Type-specific rendering engines.
 *
 */

/**
 *  Fetch the CSS classes for theh given yvers type.
 *
 *  @method yvers_css
 *  @param  type    The target type {String};
 *
 *  @return The CSS classes {String};
 */
function yvers_css( type ) {
  const primary = type.split('.').shift();
  const css     = [ type ];

  switch( primary ) {
    case 'label':
      css.push( 'text-yellow-400' );
      break;

    case 'note':
      css.push( 'text-blue-400' );
      break;

    case 'wj':
      css.push( 'text-red-400' );
      break;

    default:
      switch( primary[0] ) {
        case 's':
          css.push( ...[
            'pt-4',
            'text-lg',
            'text-center',
            'font-bold',
          ]);
          break;

        case 'r':
          css.push( ...[
            'text-md',
            'text-center',
            'italic',
          ]);
          break;
      }
      break;
  }

  return css.join(' ');
}

/**
 *  Render a verse from a 'yvers' version.
 *
 *  @method yvers_render_verse
 *  @param  key           The key for this verse {String};
 *  @param  verse         The verse entry {Object}
 *  @param  verse.markup  yvers-specific markup {Array};
 *  @param  verse.text    Raw text of this verse {String};
 *
 *  @return The rendered HTML {String};
 */
export function yvers_render_verse( key, verse ) {
  if (verse == null || ! Array.isArray(verse.markup)) { return '' }

  const html  = [
    `<div class='verse'>`,
  ];

  verse.markup.forEach( markup => {
    const key     = Object.keys(markup)[0];
    const val     = markup[key];
    const keyCss  = yvers_css( key );

    switch( key ) {
      case 'label':   // Verse label
        html.push( `<sup class="verse ${keyCss}">${val}</sup>` );
        break;

      case 'b':       // Blank line
        html.push( `<br />` );
        break;

      case 'note.f':  // Footnote
      case 'note.x':  // Cross-reference
        /* :TODO: Need to include note content to be presented either via hover
         *        or click (or in a sidebar)
         */
        html.push( `<span class="${keyCss}">#</span>` );
        break;

      default:
        if (key[0] === 's' || key[0] === 'r') {
          let text  = val;

          if (Array.isArray(val)) {
            text = val.join('');
          }

          html.push( `<p class="${keyCss}">${text}</p>` );

        } else {
          html.push( `<span class="${keyCss}">${val}</span>` );
        }
        break;
    }
    
  });

  html.push('</div>');

  return html.join('\n');
}
