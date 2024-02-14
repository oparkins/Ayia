# CTX : kubectl context
# NS  : kubectl namespace
# REL : helm release
CTX	:= local
NS	:= default
REL	:= ayia
KUBECTL := kubectl --context=$(CTX) --namespace=$(NS)
HELM    := helm --kube-context=$(CTX) --namespace=$(NS)

# App information (from package.json)
VERSION	:= $(shell awk '/^  "version":/{v=substr($$2,2,length($$2)-3);print v}'\
                       package.json )
APPNAME	:= $(shell awk '/^  "name":/{v=substr($$2,2,length($$2)-3);print v}'\
                       package.json )

# Container image name and tag
IMAGE_NAME  := harbor.nibious.com/ayia/$(APPNAME)
IMAGE_TAG   := $(VERSION)

#? Show this help message
help:
	@echo
	@echo "Available rules:"
	@awk 'BEGIN{ split("", help) } \
	  /^#\?/{ \
	    help[ length(help) ] = substr($$0,4); \
	  } \
	  /^[a-z]/{ \
	    if (length(help) < 1) { next } \
	    printf("  %-25s ", substr($$1,1,length($$1)-1)); \
	    nHelp = length(help); \
	    for (idex = 0; idex < nHelp; idex++) { \
	      if (idex > 0) { printf("%27s ", " ") } \
	      printf("%s\n", help[idex]); \
	    } \
	    split("", help); \
	  }' Makefile
	@echo

#? Run the server monitoring for source changes
#?
server: node_modules
	npm run server

#? Create a cache an initialze with the version list
#?
cache: node_modules
	@mkdir cache
	./etc/list-versions

#? Start a proxy to the mongodb service
#?
mongo-proxy:
	./etc/mongo-proxy.sh "$(NS)" "$(REL)-mongodb"

#? Build a container image
image: package.json
	podman build -t $(IMAGE_NAME):$(IMAGE_TAG) .
	podman tag $(IMAGE_NAME):$(IMAGE_TAG) $(IMAGE_NAME):latest

#? Run the current container image
image-run:
	podman run --rm -it \
	    --privileged \
	    $(IMAGE_NAME):$(IMAGE_TAG) sh

#? Save the image to a tarball
image-save: images
	podman save \
	    $(IMAGE_NAME):$(IMAGE_TAG) \
	    --output "images/$(APPNAME)-$(IMAGE_TAG).tar"

#? Push the image to the currently configured repository
#    harbor.nibious.com/ayia
image-push:
	podman push $(IMAGE_NAME):$(IMAGE_TAG)
	podman push $(IMAGE_NAME):latest

#? Delete the current image, including the 'latest' tag
image-clean:
	podman rmi $(IMAGE_NAME):$(IMAGE_TAG)
	podman rmi $(IMAGE_NAME):latest

###
#? Show the image name (informational)
image-name:
	@echo "$(IMAGE_NAME)"

#? Show the image tag (informational)
image-tag:
	@echo "$(IMAGE_TAG)"

#? Show the full image name with tag (informational)
image-full:
	@echo "$(IMAGE_NAME):$(IMAGE_TAG)"

################################################################################
# Private (no help)
#
node_modules: package.json
	npm install

images:
	mkdir images
