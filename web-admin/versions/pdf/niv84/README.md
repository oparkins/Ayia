The source for the NIV84 version is:
  https://www.christunite.com/index.php/bible/niv-1984-bible-pdf

As of 2024-08-24, this site contains a PDF for every book of the Bible in the
NIV-84 version.

These PDFs are fetched, text extracted, paying attention to chapter and verse
references, and used to generate a JSON representation that is a simplified
version of the [yvers format](/README.md#yvers-markup).

The primary extraction work is handled via a custom
[pdf-parse](https://gitlab.com/autokent/pdf-parse) based parser:
[niv84-pdf-parse.js](/lib/niv84-pdf-parse.js)

The simplified markup for this version is limited to single entry per verse.
Each verse entry consists of a single
[#p](https://ubsicap.github.io/usx/parastyles.html#p) element with a `label`
item followed by one or more enntries of verse text.
