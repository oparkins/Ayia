#!/bin/bash
#
DEPLOY='ayia-mongodb'

###
# Bitnami
#kubectl exec -it deploy/$DEPLOY -- \
#  /bin/bash -c 'mongo --norc --username $MONGODB_EXTRA_USERNAMES --password $MONGODB_EXTRA_PASSWORDS $MONGODB_EXTRA_DATABASES'

###
# Base
#kubectl exec -it deploy/$DEPLOY -- \
#  /bin/bash -c 'mongo --norc --username $MONGO_INITDB_ROOT_USERNAME --password $MONGO_INITDB_ROOT_PASSWORD $MONGO_INITDB_DATABASE'

###
# Ayia
kubectl exec -it deploy/$DEPLOY -- \
  /bin/bash -c 'mongo --norc --username $AYIA_USER_NAME --password $AYIA_USER_PASSWORD --authenticationDatabase admin $AYIA_DB_NAME'
