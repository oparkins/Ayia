The source for the NIV84 version is:
  https://www.christunite.com/index.php/bible/niv-1984-bible-pdf

As of 2024-08-24, this site contains a PDF for every book of the Bible in the
NIV-84 version.

These PDFs are fetched, text extracted, paying attention to chapter and verse
references, and used to generate a JSON representation that is a simplified
version of the [yvers format](/README.md#type-yvers-and-pdf-markup).

Extraction and JSON generation is handled by our custom
[pdf-parse](https://gitlab.com/autokent/pdf-parse) based parser: the PDF to our
JSON representation: [niv84-pdf2json](/web-admin/lib/niv84-pdf2json.js)

The simplified markup for this version is limited to single entry per verse.
Each verse entry consists of a single
[#p](https://ubsicap.github.io/usx/parastyles.html#p) element with a `label`
item followed by one or more enntries of verse text.

Chapter and verse labels are identified via heuristics primarily based upon
font color, size, and whether the content ends with a numeric value.
