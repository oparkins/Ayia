The [YouVersion Bible](https://bible.com/) allows you to download a large
number of Bible versions.

The full version list may be retrieved via: 
  https://www.bible.com/api/bible/versions?language_tag=eng&type=all

This file enumerates all available versions and each may be dounloaded
individually as a zip file. The contents of these zip files are a subdirectory
per book containing an encoded file per chapter.

The encoded chapter files can be decoded using the basics of the
[calibre-yves-input project](
https://github.com/ClashTheBunny/calibre-yves-input). It appears that this
project initially handled earlier versions of the YouVersion encodings for IOS,
but with a minor tweak can still be used to decode the current versions
downloaded directly.

To download and decode a version:
1.  Download the versions list:
    ```bash
    curl -Lks https://www.bible.com/api/bible/versions?language_tag=eng&type=all \
      -o versions.json
    ```

2.  Within `versions.json`, locate the 'url' of the version of interest,
    something like:
    ```javascript
      response.data.versions[0].offline.url
        //offline-bibles-cdn.youversionapi.com/bible/text/offline/1588-7.zip
    ```

3.  Download the offline version:
    ```bash
    curl -Lks https://offline-bibles-cdn.youversionapi.com/bible/text/offline/1588-7.zip \
      -o  1588-7.zip
    ```

4.  Extract the zip:
    ```bash
    unzip 1588-7.zip
    ```

5.  Decode a chapter:
    ```bash
    ./yvesDecode.py GEN/1.yves > GEN-01.html
    ```
