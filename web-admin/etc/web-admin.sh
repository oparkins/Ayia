#!/bin/bash
#
DEPLOY='ayia-admin'

kubectl exec -it deploy/$DEPLOY -c server -- bash -l
