/**
 *  Type-specific rendering engines.
 *
 */
import {
  html      as generate_note,
  activate  as activate_notes,
} from '$lib/verse_note';

/**
 *  Generate the HTML markup information needed to render the given
 *  block-level markup.
 *
 *  @method html_block
 *  @param  state
 *
 *  @param  verse_ref       The verse reference {String};
 *  @param  m_dex           The index of this markup element {Number};
 *  @param  markup          The target markup element {Object};
 *  @param  show            Show configuration (from state) {Object};
 *  @param  show.footnotes  Show footnotes {State};
 *  @param  show.xrefs      Show cross-references {State};
 *  @param  show.redletters Show red-letters {State};
 *
 *  The incoming `markup` represents a top-level block and has the form:
 *    { '%type%%key%: %value% }
 *
 *    type:   '#'   New block
 *            '+'   continued block
 *            '/'   end block
 *
 *    `key` identifies the block element (header, paragraph, poetry, list) and
 *    is based upon the USFM standards
 *      (https://ubsicap.github.io/usfm/paragraphs/
 *        s   section heading
 *        r   parallel passage reference
 *        p   simple paragraph
 *        li  list
 *        q   poetry
 *        ...
 *
 *    `value` is either a simple string or an array of character elements.
 *
 *  @return The HTML for this block {String};
 */
//export function html_block( verse_ref, m_dex, markup, show={} ) {
export function html_block( state ) {
  const verse_ref = state.verse_ref;
  const m_dex     = state.index;
  const markup    = state.markup;
  const show      = state.show;

  console.log('html_block(): state:', state);

  const m_key     = Object.keys(markup)[0];
  const m_val     = markup[m_key];
  const key_type  = m_key[0]; // # (new), + (cont), / (end)
  const key_parts = m_key.slice(1).split('.');
  const key0      = key_parts[0];
  const html      = [];
  const css       = key_parts;

  /* Convert the primary key to a CSS-safe value:
   *    #p  => p block-new
   *    +p  => p block-cont
   *    /p  => p block-end
   */
  switch( key_type ) {
    case '#': // new block
      css.push( 'block-new' );
      break;

    case '+': // continue block
      // assert( state.block === key0 );
      css.push( 'block-cont' );
      break;

    case '/': // end block
      css.push( 'block-end' );
      break;
  }

  const [ _full, key, level ]  = key0.match(/^([a-z]+)([0-9]+)?/);
  if (key)  {
    /* Include a non-numbered version of the key
     *    (e.g. 'li' for 'li2')
     */
    css.unshift( key );
  }

  if (m_dex == 0 || key0 !== state.block) {
    html.push( `<div class='${css.join(' ')}'>` );
  }

  if (Array.isArray(m_val)) {
    m_val.forEach( item => {
      html.push( html_char( verse_ref, m_dex, item, show ) );
    });

  } else if (m_val) {
    html.push( html_char( verse_ref, m_dex, m_val, show ) );

  }

  if (m_dex >= state.max-1 || key_type === '/') {
    html.push( '</div>' );
  }

  return html.join('');
}

/**
 *  Generate the HTML markup information needed to render the given
 *  character-level markup.
 *
 *  @method html_char
 *  @param  verse_ref       The verse reference {String};
 *  @param  m_dex           The index of theh parent element {Number};
 *  @param  item            The markup item {String | Object};
 *  @param  show            Show configuration (from state) {Object};
 *  @param  show.footnotes  Show footnotes {State};
 *  @param  show.xrefs      Show cross-references {State};
 *  @param  show.redletters Show red-letters {State};
 *
 *  Examples:
 *    item: { label: '1' }            // Verse label
 *    item: 'Jesus answered him, '    // Simple string
 *    item: { 'note.f': [ ... ] }     // In-line note
 *    item: { wj: [                   // With contained character makup
 *              '“Simon,',
 *              { it: 'son' },
 *              'of John, do you love Me'
 *            ]
 *          }
 *
 *  @return The rendered HTML {String};
 */
export function html_char( verse_ref, m_dex, item, show ) {
  console.log('yvers.render.html_char(): item:', item);

  if (typeof(item) === 'string') {
    // Simple string
    return item;
  }

  // assert( typeof(item) === 'object' );

  // Character markup object. Retrieve the type and value.
  const type  = Object.keys(item)[0];
  const val   = Object.values(item)[0];

  console.log('yvers.render.html_char(): type[ %s ], val[ %s ]:',
              type, typeof(val), val);

  // assert( typeof(val) === 'string' || Array.isArray(val) );

  if (type === 'note.f' || type === 'note.x') {
    // assert( Array.isArray(val) );

    const note_type = (type.split('.').pop());
    const css_type  = (note_type === 'x'
                        ? 'xref'
                        : 'foot');

    if (css_type === 'xref') {
      // Cross-reference
      if (! show.xrefs )      { return null }

    } else {
      // Footnote
      if (! show.footnotes )  { return null }
    }

    let   label   = '#';
    const content = val.map( (n_item, n_dex) => {
      if (typeof(n_item) === 'string') {
        return (type === 'xref'
                  ? `<span class='xt'>${n_item}</span>`
                  : n_item);
      }

      const i_key = Object.keys(n_item)[0];
      if (i_key === 'label') {
        label = n_item[i_key];
        return;
      }

      return html_char( verse_ref, m_dex, n_item, show );
    })
    .filter( el => el != null )
    .join('');

    const id  = `${verse_ref.replaceAll('.','-')}-${m_dex}`;
    return generate_note( id, type, label, content );
  }

  /**************************************************************************
   * A non-note element, possibly *within* a note.
   *
   */
  const html  = [];

  if (Array.isArray(val)) {
    // Flatten this array
    val.forEach( item => {
      html.push( html_char( verse_ref, m_dex, item, show ) );
    });

  } else {

    if (type === 'fq' || type === 'fqa') {
      // fq : Quotation from current scripture
      // fqa: Alternative Translation
      html.push( ` “` );
    }

    switch( type ) {
      case 'label':   // verse label
        html.push( `<sup class='verse label'>${val}</sup>` );
        break;

      case 'it':      // Italic
        html.push( `<i class='${type}'>${val}</i>` );
        break;

      case 'bd':      // Bold
        html.push( `<b class='${type}'>${val}</b>` );
        break;

      default:
        html.push( `<span class='${type}'>${val}</span>` );
        break;
    }

    if (type === 'fq' || type === 'fqa') {
      // fq : Quotation from current scripture
      // fqa: Alternative Translation
      html.push( `” ` );
    }
  }

  return html.join('');
}
