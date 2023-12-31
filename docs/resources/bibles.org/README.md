The American Bible Society has a nice [web API](https://bibles.org) to the
[Digital Bible Library](https://thedigitalbiblelibrary.org/).

This site allows you to download a local copy of bibles to your browser as
indexdb databases.

From the site:
> Scripture texts in DBL are contained in an XML format known as
> [USX](https://ubsicap.github.io/usx/). USX is an XML structure which is
> aligned very tightly to the internal format used in Paratext by the
> translation team. This close association with the translation environment
> used to author the text provides additional assurance that the validated
> content has not been altered by a complex conversion process.

Source URL examples:
- AMP
  - https://v2.api.bible/bibles/a81b73293d3080c9-01/books?include-chapters=true
  - https://v2.api.bible/bibles/a81b73293d3080c9-01
  - https://v2.api.bible/bibles/a81b73293d3080c9-01/chapters/GEN.intro?content-type=json&include-verse-spans=true&include-notes=true
  - https://v2.api.bible/bibles/a81b73293d3080c9-01/chapters/GEN.1?content-type=json&include-verse-spans=true&include-notes=true

---
The browser database into which the site loads local copies CAN BE exported
from the browser.

Ref: https://dfahlander.medium.com/export-indexeddb-from-a-web-app-using-devtools-62c55a8996a1


From the developer tools console

1.  Find out Database Name

    "I personally use chrome devtools but most of these instructions would work
     in Firefox, opera, edge and possible Safari as well. To open devtools on
     mac, click CMD+ALT+I. On Windows, press F12.

     In devtools, click Application tab and then unfold IndexedDB to see a list
     of database names."

2.  Import dexie-export into the page
    ```javascript
    script1 = document.createElement('script');
    script1.src = 'https://unpkg.com/dexie@3.2.2';
    document.body.appendChild(script1);

    // WAIT for this script to fully load

    script2 = document.createElement('script');
    script2.src = 'https://unpkg.com/dexie-export-import@1.0.3';
    document.body.appendChild(script2);
    ```
3.  Export the database, pasing the following to the console ONE line at a
    time;
    ```javascript
    theDBName = 'bibleStore';

    theDB = new Dexie(theDBName);
    let {verno, tables} = await theDB.open();
    theDB.close();
    theDB = new Dexie(theDBName);
    theDB.version(verno).stores(tables.reduce((p,c) => {p[c.name] = c.schema.primKey.keyPath || ""; return p;}, {}));
    theBlob = await theDB.export();

    /* WAIT until you see a response like:
     *  > Blob {size: 4977759, type: “text/json”}
     */
    ```

4.  Generate a “download link” to click on.
    ```javascript
    document.body.innerHTML = ` <a href="${URL.createObjectURL(theBlob)}">Right-click to download database export</a>`;
    ```

5.  Right-click that link and save it to your file system.

    The exported file will be a JSON file that you can inspect or parse or
    re-import using dexie-export-import package on your own application.
    See how that package works in the [docs at
    dexie.org](https://dexie.org/docs/ExportImport/dexie-export-import).
