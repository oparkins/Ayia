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
CONTAINER_REPO  := harbor.nibious.com/ayia
CONTAINER_NAME  := $(APPNAME)
CONTAINER_TAG   := $(VERSION)

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
container: package.json
	podman build -t $(CONTAINER_NAME):$(CONTAINER_TAG) .
	podman tag $(CONTAINER_NAME):$(CONTAINER_TAG) $(CONTAINER_NAME):latest

#? Run the current container image
container-run:
	podman run --rm -it \
	    --privileged \
	    $(CONTAINER_NAME):$(CONTAINER_TAG) sh

#? Save the image to a tarball
container-save: containers
	podman save \
	    $(CONTAINER_NAME):$(CONTAINER_TAG) \
	    --output "containers/$(APPNAME)-$(CONTAINER_TAG).tar"

#? Push the image to the currently configured repository
#    harbor.nibious.com/ayia
container-push:
	podman tag $(CONTAINER_NAME):$(CONTAINER_TAG) \
	           $(CONTAINER_REPO)/$(CONTAINER_NAME):$(CONTAINER_TAG)
	podman tag $(CONTAINER_NAME):$(CONTAINER_TAG) \
	           $(CONTAINER_REPO)/$(CONTAINER_NAME):latest
	podman push $(CONTAINER_REPO)/$(CONTAINER_NAME):$(CONTAINER_TAG)
	podman push $(CONTAINER_REPO)/$(CONTAINER_NAME):latest

#? Delete the current image, including the 'latest' tag
#?
container-clean:
	podman rmi $(CONTAINER_REPO)/$(CONTAINER_NAME):$(CONTAINER_TAG)
	podman rmi $(CONTAINER_REPO)/$(CONTAINER_NAME):latest
	podman rmi $(CONTAINER_NAME):$(CONTAINER_TAG)-dev
	podman rmi $(CONTAINER_NAME):$(CONTAINER_TAG)
	podman rmi $(CONTAINER_NAME):latest

###
#? Show the image name (informational)
container-name:
	@echo "$(CONTAINER_NAME)"

#? Show the image tag (informational)
container-tag:
	@echo "$(CONTAINER_TAG)"

#? Show the full image name with tag (informational)
#?
container-full:
	@echo "$(CONTAINER_NAME):$(CONTAINER_TAG)"

#? Run tests
tests: .FORCE
	npx mocha tests

################################################################################
# Private (no help)
#
node_modules: package.json
	npm install

containers:
	mkdir containers

.FORCE:
