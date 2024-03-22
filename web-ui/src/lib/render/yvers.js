/**
 *  Type-specific rendering engines.
 *
 */
import {
  html      as generate_note,
  activate  as activate_notes,
} from '$lib/verse_note';


/**
 *  Generate the HTML markup for an entire chapter.
 *
 *  @method html_chapter
 *
 *  @param  content         The retrieved chapter content of the current YVERS
 *                          book and chapter {Object};
 *                            { total: {Number},
 *                             verses: { %ref%: {markup:[...]}, ... }
 *                            }
 *  @param  show            Show configuration (from state) {Object};
 *  @param  show.footnotes  Show footnotes {State};
 *  @param  show.xrefs      Show cross-references {State};
 *  @param  show.redletters Show red-letters {State};
 *
 *  @return The HTML for this chapter {String};
 */
export function html_chapter( content, show ) {
  console.log('yvers.html_chapter(): content:', content);
  console.log('yvers.html_chapter(): show   :', show);

  if (content == null || content.verses == null) { return null }

  const state = {
    verse_ref : null,
    block     : null,
    max       : -1,
    show      : show,
    note_idex : 0,
  };

  console.log('yvers.html_chapter(): state:', state);

  const html  = [];
  const last_ref  = (Object.keys(content.verses).pop());

  console.log('yvers.html_chapter(): last_ref:', last_ref);

  for (let verse_ref in content.verses) {
    const [ _bk, _ch, vs ]  = verse_ref.split('.');

    state.verse_ref = verse_ref;
    state.verse_num = parseInt( vs );

    const verse = content.verses[ verse_ref ];
    if (! Array.isArray( verse.markup ))  { continue }

    const is_last_verse = (verse_ref === last_ref);

    console.log('yvers.html_chapter(): verse_ref[ %s ], is_last[ %s ], verse:',
                verse_ref, String(is_last_verse), verse);

    verse.markup.forEach( (markup, m_dex) => {
      state.max    = (is_last_verse ? markup.length : 999);
      state.index  = m_dex;
      state.markup = markup;

      html.push( html_continuous_block( state ) );
    });
  }

  return html.join(' ');
}

/**
 *  Generate the HTML markup information needed to render a continuous version
 *  of the given block-level markup.
 *
 *  @method html_continuous_block
 *  @param  state                 Render state {Object};
 *  @param  state.verse_ref       The verse reference {String};
 *  @param  state.m_dex           The index of this markup element {Number};
 *  @param  state.note_idex       A note counter to enable generation of unique
 *                                note identifiers{Number};
 *  @param  state.markup          The target markup element {Object};
 *  @param  state.show            Show configuration (from state) {Object};
 *  @param  state.show.footnotes  Show footnotes {State};
 *  @param  state.show.xrefs      Show cross-references {State};
 *  @param  state.show.redletters Show red-letters {State};
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
export function html_continuous_block( state ) {
  const verse_ref = state.verse_ref;
  const verse_num = state.verse_num;
  const m_dex     = state.index;
  const markup    = state.markup;
  const show      = state.show;
  /*
  console.log('html_continuous_block(): state:', state);
  // */

  const m_key     = Object.keys(markup)[0];
  const m_val     = markup[m_key];
  const key_type  = m_key[0]; // # (new), + (cont), / (end)
  const key_parts = m_key.slice(1).split('.');
  const key0      = key_parts[0];
  const html      = [];
  let   tag       = 'span';
  const css       = key_parts;

  console.log('html_continuous_block(): cur_block[ %s ], key_type[ %s ], '
              +       'key_parts:', 
              state.block, key_type, key_parts);

  /* Convert the primary key to a CSS-safe value:
   *    #p  => p block-new
   *    +p  => p block-cont
   *    /p  => p block-end
   */
  switch( key_type ) {
    case '#': // new block
      tag = 'div';
      css.push( 'block-new' );
      if (state.block) { html.push('</div>') }

      state.block = key0;
      break;

    case '+': // continue block
      // assert( state.block === key0 );
      css.push( 'block-cont' );
      break;

    case '/': // end block
      tag = 'div';
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

  if (key_type === '#') {
    // Start this new block
    html.push( `<${tag} class='${css.join(' ')}'>` );

    // Setup for an inner span, forcing a verse number
    tag = 'span';
    css.pop(); css.push( 'block-cont' );
    state.last_num = null;  // Force a verse number on the inner span
  }

  if (key_type !== '/') {
    if (verse_num !== state.last_num) {
      // Include a verse ref since we've changed since the last block start
      state.last_num = verse_num;
      html.push( `<${tag} class='${css.join(' ')}' v='${verse_num}'>` );

    } else {
      html.push( `<${tag} class='${css.join(' ')}'>` );
    }
  }

  if (Array.isArray(m_val)) {
    m_val.forEach( item => {
      html.push( html_char( state, item ) );
    });

  } else if (m_val) {
    html.push( html_char( state, m_val ) );

  }

  if (key_type !== '/') {
    html.push( `</${tag}>` );

  }

  if (key_type === '/' || m_dex >= state.max-1) {
    html.push( '</div>' );
  }

  return html.join('');
}

/**
 *  Generate the HTML markup information needed to render a self-contained
 *  version of the given block-level markup.
 *
 *  @method html_block
 *  @param  state                 Render state {Object};
 *  @param  state.verse_ref       The verse reference {String};
 *  @param  state.m_dex           The index of this markup element {Number};
 *  @param  state.note_idex       A note counter to enable generation of unique
 *                                note identifiers{Number};
 *  @param  state.markup          The target markup element {Object};
 *  @param  state.show            Show configuration (from state) {Object};
 *  @param  state.show.footnotes  Show footnotes {State};
 *  @param  state.show.xrefs      Show cross-references {State};
 *  @param  state.show.redletters Show red-letters {State};
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
  let   tag       = 'span';
  const css       = key_parts;

  /* Convert the primary key to a CSS-safe value:
   *    #p  => p block-new
   *    +p  => p block-cont
   *    /p  => p block-end
   */
  switch( key_type ) {
    case '#': // new block
      tag = 'div';
      css.push( 'block-new' );
      break;

    case '+': // continue block
      // assert( state.block === key0 );
      css.push( 'block-cont' );
      break;

    case '/': // end block
      tag = 'div';
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
    html.push( `<${tag} class='${css.join(' ')}'>` );
  }

  if (Array.isArray(m_val)) {
    m_val.forEach( item => {
      html.push( html_char( state, item ) );
    });

  } else if (m_val) {
    html.push( html_char( state, m_val ) );

  }

  if (m_dex >= state.max-1 || key_type === '/') {
    html.push( `</${tag}>` );
  }

  return html.join('');
}

/**
 *  Generate the HTML markup information needed to render the given
 *  character-level markup.
 *
 *  @method html_char
 *  @param  state                 Render state {Object};
 *  @param  state.verse_ref       The verse reference {String};
 *  @param  state.m_dex           The index of this markup element {Number};
 *  @param  state.note_idex       A note counter to enable generation of unique
 *                                note identifiers{Number};
 *  @param  state.markup          The target markup element {Object};
 *  @param  state.show            Show configuration (from state) {Object};
 *  @param  state.show.footnotes  Show footnotes {State};
 *  @param  state.show.xrefs      Show cross-references {State};
 *  @param  state.show.redletters Show red-letters {State};
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
export function html_char( state, item ) {
  const verse_ref = state.verse_ref;
  const verse_num = state.verse_num;
  const m_dex     = state.index;
  const markup    = state.markup;
  const show      = state.show;

  console.log('yvers.render.html_char(): item:', item);

  if (typeof(item) === 'string') {
    // Simple string
    return ` ${item} `;
  }

  if (Array.isArray(item)) {
    // Flatten this array
    const html  = item.map( entry => {
      return html_char( state, entry );
    });

    return html.join(' ');
  }

  // assert( typeof(item) === 'object' );

  /**************************************************************************
   * Character markup object. Retrieve the type and value.
   *
   */
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

      return html_char( state, n_item );
    })
    .filter( el => el != null )
    .join('');

    const id  = `${verse_ref.replaceAll('.','-')}-${state.note_idex}`;
    state.note_idex++;

    return generate_note( id, type, label, content );
  }

  /**************************************************************************
   * A non-note element, possibly *within* a note.
   *
   */
  const html    = [];
  const content = html_char( state, val );

  if (type === 'fq' || type === 'fqa') {
    // fq : Quotation from current scripture
    // fqa: Alternative Translation
    html.push( ` “` );
  }

  switch( type ) {
    case 'label':   // verse label
      html.push( `<sup class='verse label'>${content}</sup>` );
      break;

    case 'it':      // Italic
      html.push( `<i class='${type}'>${content}</i>` );
      break;

    case 'bd':      // Bold
      html.push( `<b class='${type}'>${content}</b>` );
      break;

    default:
      html.push( `<span class='${type}'>${content}</span>` );
      break;
  }

  if (type === 'fq' || type === 'fqa') {
    // fq : Quotation from current scripture
    // fqa: Alternative Translation
    html.push( `” ` );
  }

  return html.join(' ');
}
