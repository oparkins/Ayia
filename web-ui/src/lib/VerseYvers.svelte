<script>
  import {
    Button,
    Card,
    Dropdown,
    DropdownItem,
    Input,
    Label,
    Popover,
    Tooltip,
  } from 'flowbite-svelte';
  import { ChevronDownSolid, AnnotationSolid } from 'flowbite-svelte-icons';

  import {html_raw}   from '$lib/render/yvers';
  import VerseNote    from '$lib/VerseNote.svelte';

  /* Information about the verse to present:
   *  - verse_ref     The reference for this verse {String};
   *  - verse         The verse entry {Object}
   *  - verse.markup  yvers-specific markup {Array};
   *  - verse.text    Raw text of this verse {String};
   */
  export let verse_ref;
  export let verse;

  /**
   *  Generate the HTML markup information needed to render the given markup.
   *
   *  @method html_markup
   *  @param  markup    The target markup element {Object};
   *  @param  m_dex     The index of this markup element {Number};
   *
   *  @return HTML markup information {Object | Array};
   *            { tag, raw, component, props }
   */
  function html_markup( markup, m_dex ) {
    const m_key   = Object.keys(markup)[0];
    const m_val   = markup[m_key];
    const css     = `${m_key}`;
    const html    = {
      tag       : '@html',
      raw       : `<span class='${css}'>${m_val}</span>`,

      component : null,
      props     : {},
    };

    switch( m_key ) {
      case 'label':   // Verse label
        html.raw  = `<sup class='verse ${css}'>${m_val}</sup>`;
        break;

      case 'b':       // Blank line
        html.raw  = `<br />`;
        break;

      case 'br':      // Verse break
        html.raw  = `<p class='${css} break' />`;
        break;

      case 'it':      // Italic
        html.raw  = `<i class='${css}'>${m_val}</i>`;
        break;

      case 'note.x':    // Cross-reference : fall-through
      case 'note.f': {  // Footnote
        const id      = `${verse_ref.replaceAll('.','-')}-${m_dex}`;
        const type    = (m_key.split('.').pop() === 'x'
                          ? 'xref'
                          : 'foot');
        let   label   = '#';
        const content = m_val.map( n_obj => {
          if (typeof(n_obj) === 'string') {
            return (type === 'xref'
                      ? `<span class='xt'>${n_obj}</span>`
                      : n_obj);
          }

          const i_key = Object.keys(n_obj)[0];
          const i_val = n_obj[i_key];
          if (i_key === 'label') {
            label = i_val;
            return;
          }
          return html_raw( i_key, i_val );

        })
        .filter( el => el != null )
        .join('');

        html.tag        = '@component';
        html.component  = VerseNote;
        html.props      = { id, label, type };
        html.raw        = content;

      } break;

      default: {
        const isSect  = (m_key[0] === 's');
        const isRef   = (m_key[0] === 'r');

        if ( isSect || isRef) {
          // This is a section or reference
          html.raw  = `<p class='${m_key[0]} ${m_key}'>${m_val}</p>`;

        } else {
          html.raw  = html_raw( m_key, m_val );
        }
      } break;
    }

    return html;
  }

/* verse.makup with be:
 *  - an array  [ { tag: value }, ... ];
 *  - an object { _ref: "%multi-verse-reference" };
 */
</script>

{#if Array.isArray( verse.markup ) }
<div class='verse'>
 {#each verse.markup as markup, m_dex}
  {@const html = html_markup( markup, m_dex ) }
  {#if html.tag === '@component'}
    <svelte:component this={ html.component } { ...html.props }>
      {@html html.raw}
    </svelte:component>
  {:else}
    {@html html.raw}
  {/if }
 {/each}
</div>
{/if}
