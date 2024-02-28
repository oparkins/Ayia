# Ayia web-ui

A web-based Bible study application using:
- [Svelte](https://svelte.dev/docs/introduction);
- [Flowbite-svelte](https://flowbite-svelte.com/docs/pages/introduction),
  built on [Flowbite](https://flowbite.com/docs/getting-started/introduction/)
  (a [Tailwind](https://tailwindcss.com/docs/installation) component library).
  The use of Tailwind means we don't need any direct CSS styling within Svelte;

## Developing

During development, you'll need at least 2 terminals:
1.  To continuously (re)build the app as files are changed, serving them with
    hot module reloading;
    ```sh
    make dev      # or `npm run dev` or `npx vite dev`

    # To view the production app instead of the development app, use:
    make preview  # or `npm run preview` or `npx vite preview`
    ```
2.  To run your editor and any managment commands;

If you need to access the app from a browser on a different system, you can
make use of an `ssh` tunnel. There is an example in
[etc/port-forward](./etc/port-forward) that makes port 5173 on the remote
development machine (e.g. `op-vm`) available on your local host as port 5173.

You will also need access to the Ayia web-api server. There *should be* one
running at: https://api.ayia.nibious.com/

### Rendering

#### Type: `yvers`
Versions of this type have verse entries of the form:
```
{
  GEN.001.001: {
    markup: {
      { %type%: {String} },
      ...
    },
    text: {String},
  },
  ...
}
```

For these entries, the most common `%type%` values with references and a brief
description:
<table>
 <thead>
  <tr><th>Tag</th><th>Rendering</th></tr>
 </thead>
 <tbody>
  <tr valign='top'>
   <td>
    <a href='https://ubsicap.github.io/usx/parastyles.html#b'>b</a>
   </td>
   <td>
    Blank line.<br />
    May be used to explicitly indicate additional white space between
    paragraphs.<br />

    <p>A para element with b style type should always be empty. b should not
    be used before or after titles to indicate white-space.</p>
   </td>
  </tr>

  <tr valign='top'>
   <td>
    <a href='https://ubsicap.github.io/usx/parastyles.html#li'>li#</a>
   </td>
   <td>
    List entry.<br />
    An out-dented paragraph meant to highlight the items of a list.<br />
    <tt>#</tt> represents the level of indent<br />
    <tt>li = li1</tt> (see notes on numbered @style attributes)<br />
    <p>Within YouVersion, and empty <b>li#</b> element seems to indicate a
    line-break.</p>
   </td>
  </tr>

  <tr valign='top'>
   <td>
    <a href='https://ubsicap.github.io/usx/parastyles.html#label'>label</a>
   </td>
   <td>
    Represents the label (text) for a verse.<br />
    Items <i>before</i> the label occur <i>before</i> the verse.<br />
    <p>This is not part of the USX format but rather extracted from the
    YouVersion markup of USX data.</p>
   </td>
  </tr>

  <tr valign='top'>
   <td>
    <a href='https://ubsicap.github.io/usx/notes.html#footnote-char-style-types'>
      note.f
    </a>
   </td>
   <td>
    An element for marking various footnote content types.<br />
    This will be an array with elements of the type:
    <pre>
      { %type%: "Text" }
    </pre>
    <p>The valid types are any of the
    <a href='https://ubsicap.github.io/usx/notes.html#footnote-char-style-types'>footnote
    style types</a>, for example:</p>
    <table>
     <thead>
      <tr><th>name</th><th>use</th></tr>
     </thead>
     <tbody>
      <tr valign='top'>
       <td>label or fl</td>
       <td>
        Footnote “label” text.<br />
        Can be used for marking or “labeling” a word or words which are used
        consistently across certain types of translation notes (such as the
        words “Or” in an alternative translation style note, “Others”, “Heb.”,
        “LXX” etc.).
      </tr>
      <tr valign='top'>
       <td>fr</td>
       <td>
        Footnote “origin” reference.<br />
        This is the chapter and verse(s) that note refers to.
       </td>
      </tr>
      <tr valign='top'>
       <td>ft</td>
       <td>
        Footnote text<br />
        The primary (explanatory) text of the footnote.
       </td>
      </tr>
      <tr valign='top'>
       <td>fk</td>
       <td>
        A specific keyword/term from the text for which the footnote is being
        provided.
       </td>
      </tr>
      <tr valign='top'>
       <td>fq</td>
       <td>
        A quotation from the current scripture text translation for which the
        note is being provided.<br />
        Longer quotations are sometimes shortened using an ellipsis (i.e.
        suspension dots “…”).
       </td>
      </tr>
      <tr valign='top'>
       <td>fqa</td>
       <td>
        Footnote alternate translation.<br />
        Used to distinguish between a quotation of the current scripture text
        translation, and an alternate translation.
       </td>
      </tr>
      <tr valign='top'>
       <td>fp</td>
       <td>
        Footnote additional paragraph.<br />
        Use this marker to if you need to indicate the start of a new paragraph
        within a footnote (uncommon).
       </td>
      <tr valign='top'>
       <td>fv</td>
       <td>
        Footnote verse number.<br />
        A verse number in the the text quotation or alternative translation.
       </td>
      </tr>
     </tbody>
    </table>
   </td>
  </tr>

  <tr valign='top'>
   <td><a href='https://ubsicap.github.io/usx/parastyles.html#p'>p</a></td>
   <td>
    Normal paragraph.
   </td>
  </tr>

  <tr valign='top'>
   <td><a href='https://ubsicap.github.io/usx/parastyles.html#pi'>pi#</a></td>
   <td>
    Indented paragraph.<br />
    Used in some texts for discourse sections.<br />
    <tt>#</tt> represents the level of indent.<br />
    <tt>pi = pi1</tt> (see notes on numbered @style attributes)
   </td>
  </tr>

  <tr valign='top'>
   <td><a href='https://ubsicap.github.io/usx/parastyles.html#q'>q#</a></td>
   <td>
    Poetic line.<br />
    <tt>#</tt> represents the level of indent (i.e. q1, q2, q3 etc.).<br />
    <tt>q = q1</tt> (see notes on numbered @style attributes)
   </td>
  </tr>

  <tr valign='top'>
   <td><a href='https://ubsicap.github.io/usx/parastyles.html#s'>s#</a></td>
   <td>
    Section heading.<br />
    The typical (common) section division heading.<br />
    <tt>#</tt> represents the level of division.<br />
    <tt>s = s1</tt> (see notes on numbered @style attributes)
   </td>
  </tr>
 </tbody>
</table>

#### Type: `interlinear`
Versions of this type have verse entries of the form:
```
{
  GEN.001.001: {
    markup: {
      { %type%: {String} },
      ...
    },
    text: {String},
  },
  ...
}
```

These entries have a fairly consistent content of the form:
```
{
  language:   The language this entry references (Hebrew | Greek) {String},
  abs_vs:     The absolute verse number {Number};
  wlc:        Text from the Westminster Leningrad Codex {String};
  translit:   A transliteration of the WLC text {String};
  tos:        Identifies the type-of-speech {String};
  tos_label:  A descriptive label for `tos` {String};
  strongs:    The strongs reference number in relation to `Language` {String};
  text:       The english translation of the `wlc` text {String};
  bdb:        Notes from the Brown-Driver-Briggs lexicon {String};
                This MAY have minimal HTML markup (e.g. &lt;BR&gt;)
  heading:    An optional section heading {String | undefined};
  xref:       Any cross reference to other verse(s) {String | undefined};
                e.g. '(John 1:1-5; Hebrews 11:1-3)'
  footnotes:  Footnote text for for the Berean Standard Bible
              {String | undefined};
                This MAY have minimal HTML markup
                (e.g. &lt;i&gt;...&lt;/i&gt;)
}
```
