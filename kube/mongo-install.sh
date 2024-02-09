#!/bin/bash
#
# :XXX: Seems v5+ of mongo requires a CPU with AVX support
#
#       Since our CPU doesn't seem to have AVX, we need to fall-back to the
#       latest image prior to v5 -- 4.2.21-debian-10-r8
#
# We also create an 'ayia' user and database.
###
helm install mongodb oci://registry-1.docker.io/bitnamicharts/mongodb \
  --set image.tag=4.2.21-debian-10-r8 \
  --set 'auth.usernames={ayia}' \
  --set 'auth.passwords={ayia}' \
  --set 'auth.databases={ayia}'
