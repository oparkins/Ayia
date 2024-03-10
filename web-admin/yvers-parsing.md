A `yvers` chapter uses HTML markup and identifies chapter, title, paragraph,
and character markup using CSS `class`:
```
   chapter
     label (chapter label)
     block (e.g. s1, s2, p, li, m, ...)
       heading | verse content (starting with the first verse class)
       [ block markup uses 'div', character markup uses 'span' and
         most blocks are direct children of a 'chapter' ]
       ...
     ...
```

A verse identification at the beginning of a new block that contains no content
indicates a closure of the final block in the identified / previous verse.

Generated verse:
- Markup keys beginning with #+/ indicate blocks, any others are character
  markup;
  ```
  #   starts a new block, implicitly terminating any previous block;
  +   continues the current block with new content;
  /   explicitly terminate the current block;
  ```
- '+' *MAY* exclude the block name unless it is the first entry in markup,
  indicating a continuation of a block from a previous verse.  In this case we
  include the block type to provide rendering information when a single verse
  is rendered by itself;

- The first block of a verse MUST include a '.v' suffix indicating the start of
  the verse and providing the verse label;

- Character markup (e.g. 'wj') and notes (e.g. 'note.f') MUST be contained
  within a block element and MAY include other character markup;

- Tables are represented by blocks of the form:
  ```
  { '#row:0.0' : 'new row: content for row 0, col 0' }
  { '+row:0.0' : '.......: content for row 0, col 0' }
  { '+row:0.1' : '.......: content for row 0, col 1' }
  { '+row:0.2' : '.......: content for row 0, col 2' }

  { '#row:1.0' : 'new row: content for row 1, col 0' }
  { '+row:1.1' : '.......: content for row 1, col 1' }
  { '+row:1.2' : '.......: content for row 1, col 2' }

  ...
  ```

Generate verse data:
```
BOK.001.001: {
  markup: [
    { #s2     : "..." }           // Pre-verse heading
    { #p.v    : "..." }           // Start p + verse label -----+
    { +p      : "..." }           // cont. p (explicit) -------'
  ],
  text: "..."
}
BOK.001.002: {
  markup: [
    { #p.v    : "..." }           // Start p + verse label -----+
    { +       : "..." }           // cont. p (implicit)         |
    { +       : { note.f: {...}}  // in-line note (p)           |
    { +       : { it: "..." }}    // italic text  (p)           |
    { +       : ( wj: "..." }}    // words of Jesus (p)         |
    { +       : "..." }           // cont. p (implicit)         |
    { +       : { wj: [           // words of Jesus +(p)        |
                  "...",                                        |
                  { it: "..." },                                |
                  "...",                                        |
                ]}                                              |
    } ----------------------------------------------------------+
  ],
  text: "..."
}
BOK.001.003: {
  markup: [
    { #s2   : "..." }             // Pre-verse heading
    { #li1.v: "..." }             // Start li1 + verse label ---+
    { +     : "..." }             // cont. li1 (implicit) -----'
    { #li2  : "..." }             // new li2 (with text)
    { #li2  : "..." }             // new li2 (with text) -------+
    { +li2  : { note.f: {...}}    // in-line note (li2) -------'
    { #li2  : "..." }             // new li2 (with text) -------+
    { +     : { note.x: {...}}    // in-line note (li2)         |
    { +     : "..." }             // cont. li2 (implicit) ------+
  ],
  text: "..."
}
BOK.001.004: {
  markup: [
    { #li2.v: "..." }             // Start li2 + verse label ---+
    { +     : "..." }             // cont. li2 (implicit) -----'
    { #li2  : "..." }             // new li2 (with text)
    { #li2  : "..." }             // new li2 (with text)  ------+
    -- li2 continues to next verse                              |
  ],                                                            |
  text: "..."                                                   |
}                                                               |
BOK.001.005: {                                                  |
  markup: [                                                     |
    { +li2.v: "..." } // cont. li2 + verse label                |
    { +     : "..." } // cont. li2 (implicit) ------------------+
    { #li1  : "..." } // new li1 (with text)
  ],
  text: "..."
}
```
