# Ayia

## Development

There are two ways to build:

1. using local golang compiler by `cd api` and then `make`

2. using docker-compose by `docker-compose build`

## Documentation

Documentation is in `/doc` and will soon be built via a CI pipeline

---
## Nodejs

Requirements:
- `kubectl` (v1.29.2) with a kube configuration file for access to the Ayia k8s
  cluster
- `helm` (v3.14.0)
- `podman` (3.4.4)
- `nodejs` (v20.11.1)
- `make`

Before beginning development work you will need to obtain an account and
retrieve your CLI secret from [harbor.nibious.com](https://harbor.nibious.com).

With this secret, use `podman` to login to harbor:
```
podman login --username $USER harbor.nibious.com/ayia

# If you have saved the harbor.nibious.com token (read-only by you) in
#   ~/.local/harbor.nicious.com
podman login --username $USER --password $(cat ~/.local/harbor.nibious.com) \
  harbor.nibious.com/ayia

```

This will generate a credentials file at
`$XDG_RUNTIME_DIR/containers/auth.json`. This file may be used to generate and
load a pull secret within the k8s cluster:
```
cd helm
./etc/make-pull-creds.sh
# Creates a k8s secret populated with the credentials file generated via
# `podman login`
```

With this secret in place, you will be able to create k8s pods that pull their
image from the `harbor.nibious.com` repository.


Before installing the helm chart, you may need to create/update the web-api
and web-admin container images.
```
# web-api
cd ../web-api

make image

make image-push

# web-admin
cd ../web-admin

make image

make image-push
```

With the container images in place, you can now perform a helm install to
create mongodb, web-admin, and web-api resources:
```
cd ../helm

make helm-install
```
