[USX types](https://ubsicap.github.io/usx/)

The `data-usfm` attribute is used to identify a reference in the form of:
`BBB.C[.V]` where:
- `BBB` is the [book abbreviation](#Book abbreviations);
- `C`   is the chapter within the book (MAY be 'INTRO#');
- `V`   is the verse within the chapter;

Types are identified by DOM classes and containment:
```
version vid68 {       version with version id : data-vid='68'
  book bk1CH {        book with book id : 1CH
    intro intro1 {    book introduction with id : data-usfm='1CH.INTRO1'
      is#             Introduction section heading.
                      # denotes the title level or relative weighting.
      imt#            introduction major title.
                      # denotes the title level or relative weighting.
      im              introduction flush left (margin) paragraph
      ip              introduction paragraph
      ior             introduction outline reference range. An introduction
                      outline entry typically ends with a range of references,
                      sometimes within parentheses. This is an optional char
                      style for marking these references separately
      {
        content       introduction content
      }

      ie              introduction end. Optionally included to explicitly
                      indicate the end of the introduction material
    }

    chapter ch2 {     chapter with chapter id : data-usfm='1CH.2'

      label:            chapter label

      # Heading
      mr                Major section reference range. The text reference range
                        listed under a major section heading
      ms#               major section heading. A heading added before a broader
                        text division than what is typically considered a
                        “section” division (see s#)
                        # represents the level of division
      s#                section heading. The typical (common) section division
                        heading
                        # represents the level of division
      sp                speaker identification (e.g. Job and Song of Songs)
      qa                acrostic heading
      qd                hebrew note. A Hebrew musical performance comment
                        similar in content to many of the Hebrew Psalm titles
                        (@style d), but placed at the end of the poetic
                        section
      lh                list header. Some lists include an introductory and
                        concluding remark (lf). They are an integral part of
                        the list content, but are not list items. A list does
                        not require either or both of these elements
      lf                list footer. Some lists include an introductory (lh)
                        and concluding remark. They are an integral part of the
                        list content, but are not list items. A list does not
                        require either or both of these elements
      {
        heading:        heading text
      }

      # Paragraphs
      p                 normal paragraph
      m                 margin paragraph. Typically used to resume prose at the
                        margin (without indent) after poetry or OT quotation
                        (i.e. a continuation of the previous paragraph)
      po                opening of an epistle / letter
      pr                right-aligned paragraph
      cls               closure of an epistle / letter
      pmo               embedded text opening
      pm                embedded text paragraph
      pmc               embedded text closing
      pmr               embedded text refrain
      pi#               indented paragraph. Used in some texts for discourse
                        sections
                        # represents the level of indent
      mi                indented flush left paragraph
      pc                centered paragraph
      ph#               indented paragraph with hanging indent
                        # represents the level of indent

      q#                poetic line
                        # represents the level of indent
      qc                centered poetic line
      qr                right-aligned poetic line
      qm#               embedded text poetic line
                        # represents the level of indent 
      li#               list entry. An out-dented paragraph meant to highlight
                        the items of a list
                        # represents the level of indent
      lim#              embedded list entry. An out-dented paragraph meant to
                        highlight the items of an embedded list
                        # represents the level of indent

      {
        verse v2 {      verse with verse id : data-usfm='1CH.2.2'
                          verse v38 v39 ... : data-usfm='1CH.1.38+1CH.1.39...'

          label:        verse label

          content:      verse content (text)

          nd            Name of God (name of deity)
          wj            Words of Jesus
          sig           signature of the author of an epistle
          tl            transliterated (or foreign) word(s)
          qs            used for the expression “Selah” commonly found in
                        Psalms and Habakkuk.  This text is frequently right
                        aligned, and rendered on the same line as the previous
                        poetic text, if space allows
          ord           ordinal number ending (i.e. in 1st)
          add           translator’s addition. Words added by the translator
                        for clarity – text which is not literally a part of the
                        original language, but which was supplied to make the
                        meaning of the original clear
          bd            bold text
          it            italic text
          sc            small-cap text
          {
            content:    content
          }

          note {        A note within the text

            f|fe|ef:    Footnote (f), Endnote (fe), or Study note (ef)

              e.g. Mark 1:1 GNT  : gnt MRK.1.1

              label:    Foot/End/Study note label

              body:     The body of the note

                fr:     Footnote "origin" reference : chapter and verse(s);

                ft:     Footnote text : The primary (explanatory) text of the
                        footnote;

                fk:     A specific keyword/term from the text for which the
                        footnote is being provided;

                fq:     A quotation from the current scripture text translation
                        for which the note is being provided.  Longer quotations
                          are sometimes shortened using an ellipsis (i.e.
                          suspension dots “…”);

            x|ex:       Cross Reference

              e.g. Matthew 2:23 (GNT)     : gnt MAT.2.23
                   1 Chronicles 2:7 (GNT) : gnt 1CH.2.7

              label:    Cross reference label

              body:     The body of the cross reference

                xo:     Cross reference origin reference. This is the chapter and
                        verse(s) that target (@style=”xt”) reference(s) are being
                        provided for;

                xt:     Cross reference target reference(s). The list of target
                        scripture passages being suggested as references for
                        comparison/review with respect to the text (or concept)
                        of the origin reference. A list of book name
                        abbreviations and chapter + verse references, separated
                        by semicolons or other book list separator character;
          }
        }
      }

      # Special
      b:                blank line
      litl:             list entry total
      sd#:              semantic division (semantic space). Vertical space used
                        to divide the text into sections, in a manner similar
                        to the structure added through the use of a sequence of
                        heading texts (i.e.  <para> @style ms# and s#)
                        The purpose of <para style="sd#"> is distinct from
                        <para> @style b which primarily denotes whitespace (and
                        in particular at poetic stanza breaks) and not
                        hierarchy or division. The variable # represents the
                        level of division being marked.
    }
  }
}
```

## Book abbreviations

### Old Testament
- GEN: Genesis
- EXO: Exodus
- LEV: Leviticus
- NUM: Numbers
- DEU: Deuteronomy
- JOS: Joshua
- JDG: Judges
- RUT: Ruth
- 1SA: 1 Samuel
- 2SA: 2 Samuel
- 1KI: 1 Kings
- 2KI: 2 Kings
- 1CH: 1 Chronicles
- 2CH: 2 Chronicles
- EZR: Ezra
- NEH: Nehemiah
- EST: Esther (Hebrew)
- JOB: Job
- PSA: Psalms
- PRO: Proverbs
- ECC: Ecclesiastes
- SNG: Song of Songs
- ISA: Isaiah
- JER: Jeremiah
- LAM: Lamentations
- EZK: Ezekiel
- DAN: Daniel (Hebrew)
- HOS: Hosea
- JOL: Joel
- AMO: Amos
- OBA: Obadiah
- JON: Jonah
- MIC: Micah
- NAM: Nahum
- HAB: Habakkuk
- ZEP: Zephaniah
- HAG: Haggai
- ZEC: Zechariah
- MAL: Malachi

### New Testament
- MAT: Matthew
- MRK: Mark
- LUK: Luke
- JHN: John
- ACT: Acts
- ROM: Romans
- 1CO: 1 Corinthians
- 2CO: 2 Corinthians
- GAL: Galatians
- EPH: Ephesians
- PHP: Philippians
- COL: Colossians
- 1TH: 1 Thessalonians
- 2TH: 2 Thessalonians
- 1TI: 1 Timothy
- 2TI: 2 Timothy
- TIT: Titus
- PHM: Philemon
- HEB: Hebrews
- JAS: James
- 1PE: 1 Peter
- 2PE: 2 Peter
- 1JN: 1 John
- 2JN: 2 John
- 3JN: 3 John
- JUD: Jude
- REV: Revelation

### Deuterocanon
- TOB: Tobit
- JDT: Judith
- ESG: Esther Greek
- WIS: Wisdom of Solomon
- SIR: Sirach (Ecclesiasticus)
- BAR: Baruch
- LJE: Letter of Jeremiah
- S3Y: Song of 3 Young Men
- SUS: Susanna
- BEL: Bel and the Dragon
- 1MA: 1 Maccabees
- 2MA: 2 Maccabees
- 3MA: 3 Maccabees
- 4MA: 4 Maccabees
- 1ES: 1 Esdras (Greek)
- 2ES: 2 Esdras (Latin)
- MAN: Prayer of Manasseh
- PS2: Psalm 151
- ODA: Odes
- PSS: Psalms of Solomon
- EZA: Apocalypse of Ezra
- 5EZ: 5 Ezra
- 6EZ: 6 Ezra
- DAG: Daniel Greek
- PS3: Psalms 152-155
- 2BA: 2 Baruch (Apocalypse)
- LBA: Letter of Baruch
- JUB: Jubilees
- ENO: Enoch 1MQ - 1 Meqabyan
- 2MQ: 2 Meqabyan
- 3MQ: 3 Meqabyan
- REP: Reproof 4BA - 4 Baruch
- LAO: Laodiceans

### Non scripture
- XXA: Extra A, e.g. a hymnal
- XXB: Extra B
- XXC: Extra C
- XXD: Extra D
- XXE: Extra E
- XXF: Extra F
- XXG: Extra G
- FRT: Front Matter
- BAK: Back Matter
- OTH: Other Matter
- INT: Introduction
- CNC: Concordance
- GLO: Glossary
- TDX: Topical Index
- NDX: Names Index
