#!/bin/bash
#
# Create a pull secret from existing podman credentials.
# This ASSUMES you have successfully logged in via:
#   podman login
#
# $XDG_RUNTIME_DIR/containers/auth.json
 DIR=$(realpath "$(dirname "$0")")
ROOT=$(dirname "$DIR")

KUBECTL=$(make -sC "$ROOT" kubectl)

SECRET=$(awk '/  pullSecret:/{ print $2 }' "$ROOT/values.yaml")

$KUBECTL create secret generic ayia-pull-creds \
    --from-file=.dockerconfigjson=$XDG_RUNTIME_DIR/containers/auth.json \
    --type=kubernetes.io/dockerconfigjson
