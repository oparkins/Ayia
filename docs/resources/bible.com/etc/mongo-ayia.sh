#!/bin/bash
#
DEPLOY='mongodb'

kubectl exec -it deploy/$DEPLOY -- \
  /bin/bash -c 'mongo --norc --username $MONGODB_EXTRA_USERNAMES --password $MONGODB_EXTRA_PASSWORDS $MONGODB_EXTRA_DATABASES'

