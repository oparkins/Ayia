<script>
  import {
    show_footnotes,
    show_xrefs,
    show_redletters,
  }  from '$lib/stores';

  import { html_block } from '$lib/render/yvers';

  /* Information about the verse to present:
   *  - verse_ref     The reference for this verse {String};
   *  - verse         The verse entry {Object}
   *  - verse.markup  yvers-specific markup {Array};
   *  - verse.text    Raw text of this verse {String};
   */
  export let  verse_ref;
  export let  verse;

/* verse.makup with be:
 *  - an array  [ { tag: value }, ... ];
 *  - an object { _ref: "%multi-verse-reference" };
 */
  const state = {
    verse_ref : verse_ref,
    block     : null,
    max       : (Array.isArray( verse.markup )
                  ? verse.markup.length
                  : -1),
    show      : {
      footnotes : $show_footnotes,
      xrefs     : $show_xrefs,
      redletters: $show_redletters,
    },
  };
</script>

{#if Array.isArray( verse.markup ) }
<div class='verse'>
 {#each verse.markup as markup, m_dex}
  {@const html = html_block( {...state, index:m_dex, markup} )}
  {#if html != null}
   {@html html}
  {/if}
 {/each}
</div>
{/if}
