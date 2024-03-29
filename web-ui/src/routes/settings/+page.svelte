<script>
  import { derived }  from 'svelte/store';

  import {
    Card,
    Helper,
    Label,
    Range,
    Table,
    TableBody,
    TableBodyCell,
    TableBodyRow,
    TableHead,
    TableHeadCell,
    Toggle,
  } from 'flowbite-svelte';

  import {
    theme,
    versions,
    version as version_store,
    verse,
    user,

    content_font_size,
    show_footnotes,
    show_xrefs,
    show_redletters,

    show_il_english,
    show_il_translit,
    show_il_wlc,
    show_il_strongs,
    show_il_tos
  }  from '$lib/stores';

  import * as stores from '$lib/stores';


  import VerseYvers from '$lib/VerseYvers.svelte';

  const version_primary =version_store.primary;

  const example = {
    ref:  'JHN.003.003',
    verse: {
      markup: [
        { "label": "3" },
        { "p": "Jesus answered him, " },
        { "wj": "“Truly, truly, I say to you, unless one is " },
        { "note.x": [
            { "label": "#" },
            "See ch. 1:13 "
          ]
        },
        { "wj": "born " },
        { "note.x": [
            { "label": "#" },
            "[2 Cor. 5:17; Gal. 6:15; 1 Pet. 1:3, 23] "
          ]
        },
        { "wj": "again" },
        { "note.f": [
            { "label": "#" },
            { "fr": "3:3 " },
            { "ft": "Or " },
            { "fq": "from above" },
            { "ft": "; the Greek is purposely ambiguous and can mean both " },
            { "fq": "again " },
            { "ft": "and " },
            { "fq": "from above" },
            { "ft": "; also verse 7" }
          ]
        },
        { "p": "  " },
        { "wj": "he cannot " },
        { "note.x": [
            { "label": "#" },
            "ver. 36"
          ]
        },
        { "wj": "see the kingdom of God.”" },
        { "p": "  " }
      ],
    },
  };

  const Css = {
    container_card: [
      'flex',
      'flex-col',
      'h-full',
      'mx-auto',
      '!p-4',

      'overflow-y-auto',

      'bg-gray-100',
      'dark:bg-gray-900',
    ],

    example_card: [
      'flex',
      'flex-col',
      'mx-auto',
      '!p-4',

      'bg-gray-100',
      'dark:bg-gray-900',
    ],
    example_body: [
      'w-full',
      'min-h-20',
      'max-h-20',
      'overflow-hidden',

      'text-gray-800',
      'dark:text-gray-200',
    ],

    label: [
      'flex',
      'flex-row',
      'items-center',
      'py-2',
    ],
    label_text: [
      'w-[30ch]',
      'shrink-0',
    ],
    label_helper: [
      'inline',
      'opacity-50',
    ],
    label_control: [
      'grow',

      'flex',
      'flex-column',
      'justify-center',
    ],

    current_values: [
      'grow',
    ],

    table: [
      'h-full',
    ],
  };

  /**
   *  Toggle one of our boolean store values.
   *
   *  @method do_toggle
   *  @param  event   The triggering event {Event};
   *
   *  @return void
   */
  function do_toggle( event ) {
    const target    = event.target;
    const storeItem = target.getAttribute('data-target');
    const isChecked = (target.checked);

    console.log('do_toggle(): storeItem[ %s ], isChecked[ %s ]',
                storeItem, String(isChecked));

   stores[storeItem].set(isChecked); 

  }

  /**
   *  Handle a change to the font-size input.
   *
   *  @method change_font_size
   *  @param  event   The triggering event {Event};
   *
   *  @return void
   */
  function change_font_size( event ) {
    const target  = event.target;
    const value   = target.valueAsNumber;

    if (Number.isNaN(value)) { return }

    /*
    console.log('change_font_size(): value[ %s / %s ]', typeof(value), value);
    // */

    content_font_size.set( value );
  }

</script>

<svelte:head>
  <title>Ayia > Settings</title>
  <meta name='description' content='Ayia Bible UI > Settings' />
</svelte:head>

<div class='flex flex-col w-full h-full py-4'>
  <Card size='md' class='{ Css.container_card.join(' ') }'>
    <h5>Bible reading</h5>
    <Card size='md' class='{ Css.example_card.join(' ') }'>
      <div class='content { Css.example_body.join(' ') }'>
        <VerseYvers verse_ref={ example.ref } verse={ example.verse } />
      </div>
    </Card>

    <div class='p-4'>
      <Label class='{ Css.label.join(' ') }'>
        <div class='{ Css.label_text.join(' ')} flex flex-row justify-between'>
          <span>Font Size</span>
          <span class='pr-4'>{ $content_font_size }</span>
        </div>
        <div class='{ Css.label_control.join(' ') }'>
          <Range color='blue' size='lg'
                 min={  12 }
                 max={  36 }
                 step={ 2 }
                 value={ $content_font_size }
                 on:change={ change_font_size }
           />
        </div>
      </Label>

      <Label class='{ Css.label.join(' ') }'>
        <div class='{ Css.label_text.join(' ') }'>
          Show footnotes
          <Helper class='{ Css.label_helper.join(' ') }'>
            (when available)
          </Helper>
        </div>
        <div class='{ Css.label_control.join(' ') }'>
          <Toggle color='blue'
                  checked={ $show_footnotes }
                  data-target='show_footnotes'
                  on:change={ do_toggle } />
        </div>
      </Label>

      <Label class='{ Css.label.join(' ') }'>
        <div class='{ Css.label_text.join(' ') }'>
          Show Cross-references
          <Helper class='{ Css.label_helper.join(' ') }'>
            (when available)
          </Helper>
        </div>
        <div class='{ Css.label_control.join(' ') }'>
          <Toggle color='blue'
                  checked={ $show_xrefs }
                  data-target='show_xrefs'
                  on:change={ do_toggle } />
        </div>
      </Label>

      <Label class='{ Css.label.join(' ') }'>
        <div class='{ Css.label_text.join(' ') }'>
          Red letters
          <Helper class='{ Css.label_helper.join(' ') }'>
            (when available)
          </Helper>
        </div>
        <div class='{ Css.label_control.join(' ') }'>
          <Toggle color='blue'
                  checked={ $show_redletters }
                  data-target='show_redletters'
                  on:change={ do_toggle } />
        </div>
      </Label>

      <h5 class='pt-4'>Interlinear Settings</h5>
      <div class='p-4 pt-0'>
        <Label class='{ Css.label.join(' ') }'>
          <div class='{ Css.label_text.join(' ') }'>
            Show English
          </div>
          <div class='{ Css.label_control.join(' ') }'>
            <Toggle color='blue'
                    checked={ $show_il_english }
                    data-target='show_il_english'
                    class='opacity-25'
                    disabled
            />
          </div>
        </Label>

        <Label class='{ Css.label.join(' ') }'>
          <div class='{ Css.label_text.join(' ') }'>
            Always Display Transliteration
            <Helper class='{ Css.label_helper.join(' ') } block pl-4'>
              If off, will be available by hovering over original language
            </Helper>
          </div>
          <div class='{ Css.label_control.join(' ') }'>
            <Toggle color='blue'
                    checked={ $show_il_translit }
                    data-target='show_il_translit'
                    on:change={ do_toggle } />
          </div>
        </Label>

        <Label class='{ Css.label.join(' ') }'>
          <div class='{ Css.label_text.join(' ') }'>
            Show Original Language
          </div>
          <div class='{ Css.label_control.join(' ') }'>
            <Toggle color='blue'
                    checked={ $show_il_wlc }
                    data-target='show_il_wlc'
                    on:change={ do_toggle } />
          </div>
        </Label>


        <Label class='{ Css.label.join(' ') }'>
          <div class='{ Css.label_text.join(' ') }'>
            Show Strongs
          </div>
          <div class='{ Css.label_control.join(' ') }'>
            <Toggle color='blue'
                    checked={ $show_il_strongs }
                    data-target='show_il_strongs'
                    on:change={ do_toggle } />
          </div>
        </Label>

        <Label class='{ Css.label.join(' ') }'>
          <div class='{ Css.label_text.join(' ') }'>
            Show Type of Speech
          </div>
          <div class='{ Css.label_control.join(' ') }'>
            <Toggle color='blue'
                    checked={ $show_il_tos }
                    data-target='show_il_tos'
                    on:change={ do_toggle } />
          </div>
        </Label>
      </div>
    </div>

    <h5>Current Settings</h5>
    <div class='current { Css.current_values.join(' ') }'>
      <Table striped={true} class='current { Css.table.join(' ') }'>
        <TableHead>
          <TableHeadCell class='w-[10ch]'>Name</TableHeadCell>
          <TableHeadCell class='w-full'>Value</TableHeadCell>
        </TableHead>
        <TableBody>
          <TableBodyRow class='align-top'>
            <TableBodyCell><b>theme</b></TableBodyCell>
            <TableBodyCell>{ $theme }</TableBodyCell>
          </TableBodyRow>
          <TableBodyRow class='align-top'>
            <TableBodyCell><b>content_font_size</b></TableBodyCell>
            <TableBodyCell>{ $content_font_size }px</TableBodyCell>
          </TableBodyRow>
          <TableBodyRow class='align-top'>
            <TableBodyCell><b>show_footnotes</b></TableBodyCell>
            <TableBodyCell>{ $show_footnotes }</TableBodyCell>
          </TableBodyRow>
          <TableBodyRow class='align-top'>
            <TableBodyCell><b>show_xrefs</b></TableBodyCell>
            <TableBodyCell>{ $show_xrefs }</TableBodyCell>
          </TableBodyRow>
          <TableBodyRow class='align-top'>
            <TableBodyCell><b>show_redletters</b></TableBodyCell>
            <TableBodyCell>{ $show_redletters }</TableBodyCell>
          </TableBodyRow>
          <TableBodyRow class='align-top'>
            <TableBodyCell><b>versions</b></TableBodyCell>
            <TableBodyCell>
              { $versions ? $versions.total : -1 }
            </TableBodyCell>
          </TableBodyRow>
          <TableBodyRow class='align-top'>
            <TableBodyCell><b>version_primary</b></TableBodyCell>
            <TableBodyCell>
              <pre>{ JSON.stringify( $version_primary, null, 2 ) }</pre>
            </TableBodyCell>
          </TableBodyRow>
          <TableBodyRow class='align-top'>
            <TableBodyCell><b>verse</b></TableBodyCell>
            <TableBodyCell>
              <pre>{ JSON.stringify( $verse, null, 2 ) }</pre>
            </TableBodyCell>
          </TableBodyRow>
          <TableBodyRow class='align-top'>
            <TableBodyCell><b>user</b></TableBodyCell>
            <TableBodyCell>
              <pre>{ JSON.stringify( $user, null, 2 ) }</pre>
            </TableBodyCell>
          </TableBodyRow>
          <TableBodyRow class='align-top'>
            <TableBodyCell><b>show_il_english</b></TableBodyCell>
            <TableBodyCell>{ $show_il_english }</TableBodyCell>
          </TableBodyRow>
          <TableBodyRow class='align-top'>
            <TableBodyCell><b>show_il_wlc</b></TableBodyCell>
            <TableBodyCell>{ $show_il_wlc }</TableBodyCell>
          </TableBodyRow>
          <TableBodyRow class='align-top'>
            <TableBodyCell><b>show_il_translit</b></TableBodyCell>
            <TableBodyCell>{ $show_il_translit }</TableBodyCell>
          </TableBodyRow>
          <TableBodyRow class='align-top'>
            <TableBodyCell><b>show_il_tos</b></TableBodyCell>
            <TableBodyCell>{ $show_il_tos }</TableBodyCell>
          </TableBodyRow>
          <TableBodyRow class='align-top'>
            <TableBodyCell><b>show_il_strongs</b></TableBodyCell>
            <TableBodyCell>{ $show_il_strongs }</TableBodyCell>
          </TableBodyRow>
        </TableBody>
      </Table>
    </div>
  </Card>
</div>
