#!/bin/bash
#
#helm install mongodb oci://registry-1.docker.io/bitnamicharts/mongodb
#   ^^ core cumps
#
#helm repo add bitnami https://charts.bitnami.com/bitnami
#
#helm search repo mongo -l
#helm install mongodb bitnami/mongodb --version 13.18.5
#   ^^ core dumps

#helm install mongodb bitnami/mongodb --version 12.1.16
#   ^^ core dumps

# Seems v5+ of mongo requires a CPU with AVX support
#helm install mongodb bitnami/mongodb \
#  --set image.tag=4.2.21-debian-10-r8

###
helm install mongodb oci://registry-1.docker.io/bitnamicharts/mongodb \
  --set image.tag=4.2.21-debian-10-r8 \
  --set 'auth.usernames={aiya}' \
  --set 'auth.passwords={aiya}' \
  --set 'auth.databases={aiya}'
