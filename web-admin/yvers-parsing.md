For version 2 of the `yvers` parsing, we will encode paragraphy information
within the markup for each verse.

---
A `yvers` chapter uses HTML markup and identifies chapter, title, paragraph,
and character markup using CSS `class`:
```
  chapter
    label (chapter label)
    block (e.g. s1, s2, p, li, m, ...)
      character (e.g. heading, label, wj, it, note, row)
      ...
    ...
```

Each block may contain one or more verses. So, a single `li1` markup block may
contain *many* verses, all expected to be indented to the same level.

---
Version 2 verse markup:
- Markup keys beginning with one of the characters `#+/` indicate blocks, and
  appear at the top-level of verse `markup` entries:
  ```
  #   starts a new block, implicitly terminating any previous block;
  +   continues the current block with new content;
  /   explicitly terminate the current block;
  ```

  In this example from `AMP.EZR.002.001-002`, you see blocks `#s1`, `#p`, `+p`,
  `#b`, and `#mi`:
  ```
  'EZR.002.001': {
    markup: [
      { '#s1': 'The List of the Exiles Who Returned' },
      { '#p': [
          { label: '1' },
          'Now these are the people of the province who came up ...'
        ]
      }
    ],
    text: 'Now these are the people of the province who came up ...'
  },
  'EZR.002.002': {
    markup: [
      { '+p': [
          { label: '2' },
          'in company with Zerubbabel, Joshua, Nehemiah, Seraiah, ...'
        ]
      },
      { '#b': null },
      { '#mi': 'The list of the men of the people of Israel:' },
      { '#b': null }
    ],
    text: 'in company with Zerubbabel, Joshua, Nehemiah, Seraiah, ...'
  }
  ```

- Blocks within a verse that appear *before* the first block containing a
  `label` are actually inter-verse content that isn't technically part of the
  verse. This typically occurs at the beginning of the chapter when the first
  verse has not yet been identified, but there are heading blocks. For example,
  the `#s` block as the first markup element from `AMP.JHN.001.001`:
  ```
  'JHN.001.001': {
    markup: [
      { '#s': 'The Deity of Jesus Christ' },
      { '#p': [
          { label: '1' },
          'In the beginning [before all time] was the Word (',
          { 'note.f': [
              { label: '#' },
              { ft: [
                  'In John the Apostle’s vision (Rev 19), he sees Christ ...',
                  { nd: 'Lord' },
                  'OF LORDS.” (Rev 19:13, 16).'
                ]
              }
            ]
          },
          'Christ), and the Word was with God, and',
          { 'note.f': [
              { label: '#' },
              { ft: 'In this phrase, “God” appears first in the Greek ...' }
            ]
          },
          'the Word was God Himself.'
        ]
      }
    ]
    text: 'In the beginning [before all time] was the Word ( Christ), ...'
  }
  ```

- Inter-verse blocks are most often found at the end of a verse.
  For example, the final `#s` markup element from `AMP.JHN.021.017`:
  ```
  'JHN.021.017': {
    markup: [
      { '+p': [
          { label: '17' },
          'He said to him the third time,',
          { wj: [ '“Simon,', { it: 'son' }, 'of John, do you love Me' ] },
          '[with a deep, personal affection for Me, as for a close ...',
          { wj: '“Do you' },
          '[really]',
          { 'note.f': [
              { label: '#' },
              { ft: [
                  'This time Jesus uses the same word for love that ...',
                  { it: 'phileo)' },
                  '.'
                ]
              }
            ]
          },
          { wj: 'love Me' },
          '[with a deep, personal affection, as for a close friend]?” ...',
          { wj: '“Feed My sheep.' }
        ]
      },
      { '#s': 'Our Times Are in His Hand' }
    ],
    text: 'He said to him the third time, “Simon, son of John, do you ...'
  }
  ```

- Character markup (e.g. 'wj') and notes (e.g. 'note.f') MUST be contained
  within a block element and MAY include other, nested character markup.
  For example, the first `wj` and `note.f/ft` elements of `AMP.JHN.021.017`:
  ```
  'JHN.021.017': {
    markup: [
      { '+p': [
          { label: '17' },
          'He said to him the third time,',
          { wj: [ '“Simon,', { it: 'son' }, 'of John, do you love Me' ] },
          '[with a deep, personal affection for Me, as for a close ...',
          { wj: '“Do you' },
          '[really]',
          { 'note.f': [
              { label: '#' },
              { ft: [
                  'This time Jesus uses the same word for love that ...',
                  { it: 'phileo)' },
                  '.'
                ]
              }
            ]
          },
          { wj: 'love Me' },
          '[with a deep, personal affection, as for a close friend]?” ...',
          { wj: '“Feed My sheep.' }
        ]
      },
      { '#s': 'Our Times Are in His Hand' }
    ],
    text: 'He said to him the third time, “Simon, son of John, do you ...'
  }
  ```

- Tables are represented by blocks that identify the row and column of the
  entry. For example, `NIV.EZR.002.003-20` includes a 2-column table that spans
  17 verses:
  ```
  'EZR.002.003': {
    markup: [
      { '#row:0.0': [ { label: '3' }, 'the descendants of Parosh' ] },
      { '+row:0.1': '2,172' }
    ],
    text: 'the descendants of Parosh 2,172'
  },
  'EZR.002.004': {
    markup: [
      { '#row:1.0': [ { label: '4' }, 'of Shephatiah' ] },
      { '+row:1.1': '372' }
    ],
    text: 'of Shephatiah 372'
  },
  ...
  'EZR.002.019': {
    markup: [
      { '#row:16.0': [ { label: '19' }, 'of Hashum' ] },
      { '+row:16.1': '223' }
    ],
    text: 'of Hashum 223'
  },
  'EZR.002.020': {
    markup: [
      { '#row:17.0': [ { label: '20' }, 'of Gibbar' ] },
      { '+row:17.1': '95' }
    ],
    text: 'of Gibbar 95'
  },
  ```
