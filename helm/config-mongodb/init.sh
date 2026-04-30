#!/bin/bash
#
# Initialize mongodb for use by Ayia using environment variables:
#   AYIA_DB_NAME
#   AYIA_USER_NAME
#   AYIA_USER_PASSWORD
#
mongoShell="mongo"
mongo=( "$mongoShell" --host 127.0.0.1 --port 27017 --quiet )
rootAuthDatabase='admin'

echo "init.sh: Create Ayia database/user/password"
"${mongo[@]}" "$rootAuthDatabase" <<-EOJS
  db.createUser({
    user: $(_js_escape "$AYIA_USER_NAME"),
    pwd: $(_js_escape "$AYIA_USER_PASSWORD"),
    roles: [ { role: 'root', db: $(_js_escape "$AYIA_DB_NAME") } ]
  })
EOJS
