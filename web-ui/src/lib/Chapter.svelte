<script>
  /**
   *  Present the content of a single chapter within a controller the provides
   *  the target version, book, verse (ref), and chapter content.
   *
   *  @element  Chapter
   *  @prop     is_loading    Indicates whether `content` is currently being
   *                          loaded {Boolean};
   *  @prop     version       The current version {Version};
   *  @prop     book          The target book {Book};
   *  @prop     verse         The target verse {VerseRef};
   *  @prop     content       Chapter content for the current `version`,
   *                          `book`, and `verse` {Object};
   *
   *  External properties {
   */
  export let is_loading = true;
  export let version    = null;   // The target version
  export let book       = null;   // The target book
  export let verse      = null;   // The target verse
  export let content    = null;   // Chapter content

  /*  External properties }
   *************************************************************************
   *  Imports {
   *
   */
  import VerseText        from '$lib/VerseText.svelte';
  import VerseYvers       from '$lib/VerseYvers.svelte';
  import VerseInterlinear from '$lib/VerseInterlinear.svelte';

  /*  Imports }
   *************************************************************************
   *  Local state/methods {
   */
  let verse_el  = VerseText;

  function update_el( version ) {
    if (version == null)  { return }

    switch( version.type ) {
      case 'yvers':
        verse_el = VerseYvers;
        break;

      case 'interlinear':
        verse_el = VerseInterlinear;
        break;

      default:
        verse_el = VerseText;
        break;
    }
  }

  // When `version` changes, update the verse element
  $: update_el( version );

  /*  Local state/Methods }
   *************************************************************************
   *  Styling {
   */
  const Css = {
    content: [
      'w-full',
      'h-full',
      'pb-4',

      'overflow-y-auto',

      'text-gray-800',
      'dark:text-gray-200',

      'border-b',
      'border-gray-200',
      'dark:border-gray-600',
    ],
  };

  /*  Styling }
   *************************************************************************/
</script>

<div class='content { Css.content.join(' ') }'>
  {#if is_loading}
    Loading { verse.ui_ref } ...
  {:else if content}
    {#if (book && verse) }
      <div class='chapter header'>
        <span class='chapter name'>{ book.name }</span>
        <span class='chapter number'>{ verse.chapter }</span>
      </div>
    {/if}

    {#each Object.entries(content.verses) as [verse_ref, verse]}
      <svelte:component
          this={      verse_el }
          verse_ref={ verse_ref }
          verse={     verse }
      />
    {/each}
  {:else if verse}
    { verse.ui_ref } [ { verse.api_ref } ]
  {:else}
    Select the desired verse above
  {/if}
</div>
