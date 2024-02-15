#!/bin/bash
#
DEPLOY='ayia-mongodb'

kubectl exec -it deploy/$DEPLOY -- \
  /bin/bash -c 'mongo --norc --username $MONGODB_ROOT_USER --password $MONGODB_ROOT_PASSWORD'
