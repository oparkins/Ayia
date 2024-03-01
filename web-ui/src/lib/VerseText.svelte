<script>
  /* Information about the verse to present:
   *  - verse_ref     The reference for this verse {String};
   *  - verse         The verse entry {Object}
   *  - verse.markup  yvers-specific markup {Array};
   *  - verse.text    Raw text of this verse {String};
   */
  export let verse_ref;
  export let verse;

  const CssClass  = {
    verse: [
      '!block',
      'pb-2',
    ],

    label: [
      'inline',
    ],

    text: [
      'inline',
    ],
  };
</script>

<div class='verse { CssClass.verse.join(' ') }'>
  <span class='verse label { CssClass.label.join(' ') }'>
    { verse_ref }
  </span>
  <span class='text { CssClass.text.join(' ') }'>
    { verse.text }
  </span>
</div>
