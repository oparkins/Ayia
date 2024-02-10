#!/bin/bash
#
# Create a proxy to the mongodb service
#
NS='default'
SVC='mongodb'

PORT=$(kubectl --namespace=$NS get svc/$SVC | 
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
