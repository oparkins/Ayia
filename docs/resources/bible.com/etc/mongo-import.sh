#!/bin/bash
#
# mongoimport --uri 'mongodb+srv://mycluster-ABCDE.azure.mongodb.net/test?retryWrites=true&w=majority' \
#   --username='MYUSERNAME' \
#   --password='SECRETPASSWORD'
#
# mongo --norc \
#   --username $MONGODB_ROOT_USER \
#   --password $MONGODB_ROOT_PASSWORD'
#
# mongo --norc \
#   --username $MONGODB_EXTRA_USERNAMES \
#   --password $MONGODB_EXTRA_PASSWORDS $MONGODB_EXTRA_DATABASES
#
DEPLOY='mongodb'

kubectl exec -it deploy/$DEPLOY -- \
  /bin/bash -c 'mongo --norc --username $MONGODB_EXTRA_USERNAMES --password $MONGODB_EXTRA_PASSWORDS $MONGODB_EXTRA_DATABASES'
