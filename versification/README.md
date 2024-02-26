Generate a JSON version of versification schemes from the
[Sword-1.9.0](https://www.crosswire.org/ftpmirror/pub/sword/source/v1.9/sword-1.9.0.tar.gz)
sources.

The relevant include files have been copied from Sword to [include/](include/)
with the addition of [include/sbook.h](include/sbook.h) and
[toJson.c](toJson.c) to tie them all together.

This will generate a JSON file of the form:
```
{
  "%SCHEME%": {
    "%Book Name%": [ ch1-maxVerses, ch2-maxVerses, ... ],
    ...
  },
  ...
}
```

To build, you should be able to simply run `make`

To run, `./toJson`
