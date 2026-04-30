#!/bin/bash
#
DEPLOY='ayia-mongodb'

###
# Bitnami
#kubectl exec -it deploy/$DEPLOY -- \
#  /bin/bash -c 'mongo --norc --username $MONGODB_ROOT_USER --password $MONGODB_ROOT_PASSWORD'

###
kubectl exec -it deploy/$DEPLOY -- \
  /bin/bash -c 'mongo --norc --username $MONGO_INITDB_ROOT_USERNAME --password $MONGO_INITDB_ROOT_PASSWORD'
