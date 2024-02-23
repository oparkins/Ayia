The source for this version is:
  https://bereanbible.com/bsb_tables.xlsx

This spreadsheet has 5 worksheets, first 4 of which are empty.

The 5th worksheet contains the data.


## Columns in the 5th worksheet

Column 0 seems to always be empty so the actual column count is 1 less.

Rows & Columns:
```
  Row 1: A comment about the source
  Row 2: The column headers / field identifiers
    1   : Heb Sort                            {Number | Empty};
    2   : Grk Sort                            {Number | Empty};
    3   : BSB Sort                            {Number};
    4   : Language (Hebrew | Greek)           {String};
    5   : Vs                                  {Number};
    6   : WLC / Nestle Base ...               {String};
    7   : ⇔                                   {Empty};
    8   : Translit                            {String};
    9   : Parsing                             {String};
    10  : The header label is empty but this  {String};
          seems to be a continuation of
          column 9 as a full description
          of the 'Parsing' value
    11  : Strongs                             {Number};
    12  : Verse                               {String | Empty};
    13  : Heading                             {String | Empty};
    14  : Cross Reference                     {String | Empty};
    15  : BSB Version                         {String};
    16  : Footnotes                           {String | Empty};
    17..: BDB / Thayers                       {String};
```

<table>
 <thead>
  <tr><th>Column(s)</th><th>Label</th><th>Information</th></tr>
 </thead>
 <tbody>
  <tr>
   <td>1-3</td>
   <td>Heb/Grk/BSB Sort</td>
   <td>
    Labels suggest they are language-specific sort orders but their values
    seem to be some sort of index into the sentence...
   </td>
  </tr>

  <tr>
   <td>5</td>
   <td>Vs</td>
   <td>
    Seems to be a total verse count from the beginning indicating a
    specific Book/Chapter/Verse. This has the same values for all entries
    within a single verse.
   </td>
  </tr>

  <tr>
   <td>6</td>
   <td>WLC / Nestle Base</td>
   <td>
    Text from the Westminster Leningrad Codex is the oldest complete
    manuscript of the Hebrew Bible in Hebrew, using the Masoretic Text and
    Tiberian vocalization.  According to its colophon, it was made in Cairo
    in AD 1008 (or possibly 1009).[1]
    <br />
      https://en.wikipedia.org/wiki/Leningrad_Codex
   </td>
  </tr>

  <tr>
   <td>9-10:</td>
   <td>rsing</td>
   <td>
    Identifies the type-of-speech (Columnn 9) with descrpition (Column 10),
    for example:
    <table>
     <thead>
      <tr><th>9</th><th>10</th></tr>
     </thead>
     <tbody>
       <tr>
        <td>Prep-b | N-fs</td>
        <td>Preposition-b | Noun - feminine singular</td>
       </tr>
       <tr>
        <td>N-mp</td>
        <td>Noun - masculine plural</td>
       </tr>
       <tr>
        <td>DiObjM</td>
        <td>Direct object marker</td>
       </tr>
       <tr>
        <td>V-Qal-Perf-3ms</td>
        <td>Verb - Qal - Perfect - third person masculine singulr</td>
       </tr>
       <tr>
        <td>Art | N-mp</td>
        <td>Article | Noun - masculine singular</td>
       </tr>
     </tbody>
    </table>
   </td>
  </tr>

  <tr>
   <td>12</td>
   <td>Verse</td>
   <td>
    The textual verse reference in the form `Book chapter:verse`.
    If this column is empty, the entry is related to the last verse where
    this column was NOT empty. All items with no entry here will share
    the same value for Column 5 (Vs).
    <br />
      e.g. 'Genesis 1:1'
   </td>
  </tr>

  <tr>
   <td>13</td>
   <td>Heading</td>
   <td>
    Seems to be a section heading of some sort that only appears in some
    entries.
   </td>
  </tr>

  <tr>
   <td>14</td>
   <td>Cross Reference</td>
   <td>
    Any cross reference to other verse(s).
    <br />
      e.g. '(John 1:1-5; Hebrews 11:1-3)'
   </td>
  </tr>

  <tr>
   <td>15</td>
   <td>BSB Version</td>
   <td>
    The english translation for the Berean Standard Bible.
    <br />
    There are several special cases for this column:
    <ul>
      <li>'-'     : no translation?</li>
      <li>'- ...' : no translation + white-space-delimited punctuation?</li>
    </ul>
   </td>
  </tr>

  <tr>
   <td>17</td>
   <td>BDB / Thayers</td>
   <td>
    This can overflow multiple columns but is fully contained in Column 17.
    <br />
    When there is an overflow, there will be one final, empty column at the end
    of the overflow.
    <br />
    These are notes from the Brown-Driver-Briggs lexicon, a well-respected
    Hebrew and English lexicon:
    <br />
      https://www.blueletterbible.org/resources/lexical/bdb.cfm
   </td>
  </tr>
 </tbody>
</table>
