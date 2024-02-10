#!/bin/bash
#
DEPLOY='mongodb'

kubectl exec -it deploy/$DEPLOY -- bash
