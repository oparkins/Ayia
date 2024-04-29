<script>
  import { beforeUpdate, tick } from 'svelte';

  import {
    show_footnotes,
    show_xrefs,
    show_redletters,
  }  from '$lib/stores';

  import { html_block } from '$lib/render/yvers';
  import { activate  as activate_notes }  from '$lib/verse_note';

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
    index     : 0,
    note_idex : 0,
    markup    : null,
    show      : {
      footnotes : $show_footnotes,
      xrefs     : $show_xrefs,
      redletters: $show_redletters,
    },
  };

  // As soon as this component has been updated, activate all popovers
  let container_el  = null;
  beforeUpdate(async () => {
    await tick();
    activate_notes( container_el );
  });
</script>

{#if Array.isArray( verse.markup ) }
  <div class='verse' bind:this={container_el} >
 {#each verse.markup as markup, m_dex}
  {@const html = html_block( {...state, index:m_dex, markup} )}
  {#if html != null}
   {@html html}
  {/if}
 {/each}
</div>
{/if}
