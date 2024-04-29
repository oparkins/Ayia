### References
- https://ubsicap.github.io/usfm/paragraphs/index.html
- https://ubsicap.github.io/usx/elements.html#para


### Title, Heading, and Label markup
- `d`   : Descriptive title       (NIV11  - HAB.3.1; PSA.145.1);
- `ms#` : Major section           (NIV11  - PRO.1.1; PSA.107.1);
- `mr`  : Major section reference (NIV11  - PSA.1.1; PSA.107.1);
- `r`   : Parallel passage ref    (GNT    - 1CH.1.1; PSA.108.1);
- `s#`  : Section heading         (NIV11  - 1CH.1.1; ZEP.3.8; REV.1.1);
- `sp`  : Speaker identification  (NIV11  - SNG.1.1; SNG.8.13);
- `sr`  : Section reference       (GNT    - JOB.4.1; JOB.32.1);

### Chapter and Verse markup
- `cl`  : Chapter label           (NIV11  - PSA.1.1; PSA.150.1);
- `va`  : Alternative verse num   (NRSV   - EXO.22.1);
- `vp`  : Published verse char    (NRSV   - EXO.22.1-3);

### Paragraph markup
- `li#` : List entry              (NIV11  - 1CH.1.3-20; ROM.16.2-16);
- `lim#`: Embedded list entry     (NLT    - NEH.7.46-58);
- `m`   : Margin paragraph        (NIV11  - NUM.26.40-43, ROM.15.9-11);
- `mi`  : Indented flush left     (NIV11  - NUM.7.78; REV.16.14);
- `pc`  : Centered paragraph      (NIV11  - DAN.5.25; EZK.48.35; REV.17.5);
- `pi#` : Indented paragraph      (NIV11  - DEU.5.5, EXO.20.1 `pi3`);
- `pm`  : Embedded text paragraph (NLT    - REV.3.21, REV.22.6);
- `pmc` : Embedded text closing   (NIV11  - ACT.15.29);
- `pmo` : Embedded text opening   (NLT    - REV.22.15, TIT.3.4);
- `pmr` : Embedded text refrain   (NIV11  - DEU.27.16; ESV - PSA.89.52);
- `q#`  : Poetic line             (NIV11  - 1CH.12.18 `q1`, `q2`, `q3`);
- `qa`  : Acrostic heading        (NIV11  - PSA.119.1; PSA.119.8);
- `qc`  : Poetic line center      (NIV11  - JOL.3.21; PSA.41.13; REV.4.8);
- `qm#` : Embedded text poetic    (NIV11  - 2CH.6.41-42; DAN.4.2-3);
- `qr`  : Poetic line right       (NIV11  - PSA.136.1-26);
- `qs`  : Selah                   (ESV    - HAB.3.13; PSA.3.4; PSA.3.8);

### Character markup
- `add` : Translator's addition   (ESV    - JHN.7.52; MRK.16.8);
- `bd`  : Bold                    (AMP    - SNG.8.5; TIT.3.15; ZEC.12.1);
- `bdit`: Bold/italic             (ESV    - PRO.28.14; PSA.29.11; ZEC.9.1);
- `bk`  : Quoted book title       (GNT    - 1CH.9.1);
- `em`  : Emphasis                (MEV    - 1CH.1.5-9);
- `it`  : Italic                  (NIV11  _ JHN.7.53; MRK.16.19-20);
- `nd`  : Name of God             (NIV11  - 1CH.2.7; ZEC.3.4-9);
- `no`  : Normal text`            (GNT    - EZR.10.18);
- `ord` : Ordinal number ending   (NIV11  - AMO.INTRO1, HAB.INTRO1);
- `qt`  : Quoted text             (NIV11  - 1CO.INTRO1; 1JN.INTRO1);
- `sc`  : Small cap               (NIV11  - ACT.17.23; ZEC.14.20);
- `sig` : Signature of author     (GNT    - 1CO.16.21; 2TH.3.17; COL.4.18);
- `sls` : Secondary language      (NKJV   - DAN.5.26-28; ZEC.14.20);
- `sup` : Superscript             (NLT    - 1SA.10.27; 1SA.11.1);
- `tl`  : Transliterated word     (NIV11  - 1CH.15.20-21; ROM.14.10);
- `wj`  : Words of Jesus          (NIV11  - JHN.5.5-47; AMP JHN5.25);

### Notes (Footnotes & Cross References)
- `f`     : Footnote
  - `fl`  : Label
  - `fk`  : Specific keyword/term from the text
  - `fp`  : Additional paragraph
  - `fq`  : Translation quotation
  - `fqa` : Alternate translation
  - `fr`  : Origin reference
  - `ft`  : Text
  - `fv`  : Verse number
  - `fw`  : Witness list

  - Example: (GNT - JHN.7.38)
    ```
    <note caller="+" style="f">
     <char style="fr">7.38: </char>
     <char style="ft">Jesus' words in verses 37-38 may be translated: </char>
     <char style="fqa">“Whoever is thirsty should come to me and drink. </char>
     <char style="fv">38</char>
     As the scripture says, ‘Streams of life-giving water will pour out from
     within anyone who believes in me.’”
    </note>
    ```
- `x`     : Cross reference
  - `xk`  : A keyword from scripture translatin text
  - `xo`  : Origin reference
  - `xop` : Published origin reference
  - `xot` : Reference or other text if Old Testament books are included
  - `xnt` : Reference or other text if New Testament books are included
  - `xq`  : Scripture text quotation
  - `xt`  : Target reference(s) separated by ';' or book list separator
               [A-Z1-4]{3}(-[A-Z1-4]{3})? ?[a-z0-9\-:]*
  - `xta` : Target reference added text
  - Example: (GNT MAT.3.0)
    ```
    <note caller="-" style="x">
     <char style="xo">3.0: </char>
     <char style="xta">Compare with </char>
     <char style="xt">Mk 1.1-8; Lk 3.1-18; </char>
     <char style="xta">and</char>
     <char style="xt">Jn 1.19-28 </char>
     <char style="xta">parallel passages.</char>
    </note>
    ```

### Table markup
NIV11
- 1CH.25.9-31
- EZR.1.8-10
- EZR.2.3-20
- NEH.7.63
