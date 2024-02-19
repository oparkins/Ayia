## Pulling versions

Before pulling any versions, make sure the `cache/` subdirectory exists.

You locate all available versions via `./etc/list-versions` and pull any single
version via:
```
./etc/get-version %version-abbr%
```

## Parsing versions

The version data from `cache/` can be parsed in multiple ways:
- `./etc/parse-version` will present a simplified view of the HTML DOM;
- `./etc/json-version` uses the data visible from `parse-version` to generate a
  JSON representation of the data. This is the data we load into the backend
  mongodb;

## Loading versions

The version data from `cache/` can be parsed and loaded into the backend
mongodb via `./etc/load-version`.

This utilities makes use of `./etc/config.yaml` to identify the target mongodb
along with access credentions and collection names.

If you don't have direct access to the backend mongodb, you can use a proxy for
access as exemplified in `./etc/mongo-proxy.sh`.


For example, to download, parse, and load the NIV version:
```
./etc/load-version niv
```
