# Ayia Administration

Ayia makes use of a number of Biblical sources.
- YouVersion
- Berean Standard Bible
- Strongs

These all need to be fetched, extracted, prepared and loaded into the Ayia
database.


Before proceeding, make sure you have initialized the project:
```
npm install
```


## Viewing sources

You can view/identify all available sources via:
```
./etc/version-list

# Lists all available versions/sources presenting:
#   Offical Abbreviation : Local Abbreviation : Full Name
```

You can also view more details about a specific source via:
```
./etc/version-find %Abbreviation%

```

## Loading sources

The loading process involves 4 steps:
1.  Fetch   : download the source data;
    ```
    ./etc/version-fetch %Abbreviation%
    ```
2.  Extract : extract the source data into a processable form;
    ```
    ./etc/version-extract %Abbreviation%
    ```
3.  Prepare : prepare the extracted data for loading;
    ```
    ./etc/version-prepare %Abbreviation%
    ```
4.  Load    : load the prepared data into the database;
    ```
    ./etc/version-load %Abbreviation%
    ```

Each step will automatically invoke the previous if the data required for a
step is not yet available.

Note that the final `Load` process requires direct access to the Ayia database.

From within a container in the Ayia k8s cluster, this should already be setup.

From an external system, this requires additional work:
1.  Request `kubectl` configuration for the Ayia k8s cluster along with
    database access credentials (username, password, database name);
2.  Install `kubectl`;
3.  Setup your `kubectl` configuration to include the Ayia k8s cluster
    credentials;
4.  Update the `CTX` varialbe in [Makefile](Makefile) with the kubectl context
    you established in your local `kubectl` configuration;
5.  Create a proxy from the external system to the Ayia k8s cluster. With a
    functional `kubectl` configuration file and proper updates to `CTX`, you
    should be able to use the [etc/mongo-proxy.sh](etc/mongo-proxy.sh) helper
    script for this;
6.  Update [etc/config.yaml](etc/config.yaml) with the Ayia database access
    credentials;
