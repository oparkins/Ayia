#!/bin/bash
#
# Retrieve the mongodb password.
#
#   mongo-secrets
#
SEC='ayia-mongodb'

echo "Mongodb ($SEC):"
kubectl get secret/$SEC -o yaml 2>&1 | awk '
  /^[a-z]*:/{decode=($1 == "data:"); next; }
  {
    if (! decode) { next }
    KEY = $1;
    VAL = $2;

    cmd="echo -n "VAL" | base64 --decode";
    cmd | getline DECODED;
    close(cmd);

    printf("   %-15s %s\n", KEY, DECODED);
  }
'
