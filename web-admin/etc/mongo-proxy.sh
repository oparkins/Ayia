#!/bin/bash
#
# Create a proxy to the mongodb service
#
# Usage: mongo-proxy.sh [context [namespace [service]]]
#
ETC="$(dirname $(realpath "$0"))"
ROOT="$(dirname "$DIR")"

[ $# -gt 0 ] && CTX=$1 || CTX="$( awk '/^CTX/{print $3}' $ROOT/Makefile)"
[ $# -gt 1 ] &&  NS=$2 ||  NS="$( awk '/^NS/{ print $3}' $ROOT/Makefile)"
[ $# -gt 2 ] && SVC=$3 || SVC="$( awk '/^REL/{printf("%s-mongodb",$3)}' \
                                                         $ROOT/Makefile)"

PORT=$(kubectl --context=$CTX --namespace=$NS get svc/$SVC |
        awk '/ClusterIP/{split($5,a,"/"); print a[1]}')
if [ -z "$PORT" ]; then
  cat <<EOF
*** Cannot identify the ClusterIP port for mongodb
***   Namespace: $NS
***   Service  : $SVC
EOF
  exit -1
fi

echo ">>> Port forward $SVC @ $PORT"
kubectl --namespace=$NS port-forward svc/$SVC $PORT:$PORT
