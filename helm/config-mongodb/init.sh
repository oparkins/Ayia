#!/bin/bash
#
# Initialize mongodb for use by Ayia using environment variables:
#   AYIA_DB_NAME
#   AYIA_USER_NAME
#   AYIA_USER_PASSWORD
#
_js_escape() {
  jq --null-input --arg 'str' "$1" '$str'
}

mongo=(
  mongo --norc
  --username "$MONGO_INITDB_ROOT_USERNAME"
  --password "$MONGO_INITDB_ROOT_PASSWORD"
)
rootAuthDatabase='admin'

echo "init.sh: Create Ayia database/user/password"
"${mongo[@]}" "$rootAuthDatabase" <<-EOJS
  db.createUser({
    user: $(_js_escape "$AYIA_USER_NAME"),
    pwd: $(_js_escape "$AYIA_USER_PASSWORD"),
    roles: [
      { role: 'readWrite', db: $(_js_escape "$AYIA_DB_NAME") },
      { role: 'dbAdmin',   db: $(_js_escape "$AYIA_DB_NAME") },
    ]
  })
EOJS
#    roles: [ { role: 'root', db: $(_js_escape "$AYIA_DB_NAME") } ]
#      { role: 'backup',    db: $(_js_escape "$AYIA_DB_NAME") },
#      { role: 'restore',   db: $(_js_escape "$AYIA_DB_NAME") },
