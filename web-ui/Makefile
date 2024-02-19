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
#?
help:
	@echo
	@echo "Available rules:"
	@awk 'BEGIN{ split("", help) } \
	      /^#\?/{ \
	        help[ length(help) ] = substr($$0,4); \
	      } \
	      /^[a-z]/{ \
	        if ( length(help) < 1) { next } \
	        printf("  %-15s ",substr($$1,1,length($$1)-1)); \
	        nHelp = length(help); \
	        for ( idex = 0; idex < nHelp; idex++) { \
	          if (idex > 0) { printf("%19s ", " ") } \
	          printf("%s\n", help[idex]); \
	        } \
	        split("", help); \
	      }' Makefile
	@echo

#? Build the svelte application
build: static/css/smui.css
	@npm run build

#? Build the svelte application, rebuilding on any change
#?
build-watch: static/css/smui.css
	@npm run build -- --watch

#? Build the dev svelte application (with source maps)
build-dev: static/css/smui.css
	@npm run build -- --mode=development

#? Build the dev svelte application, rebuilding on any change
build-dev-watch: static/css/smui.css
	@npm run build -- --mode=development --watch

#? Build the smui theme
#?
build-theme: static/css/smui.css

#? Run a vite dev server
dev: static/css/smui.css
	@npm run dev

#? Run the svelte application in preview mode
#?
preview: static/css/smui.css
	@npm run preview

#? Run the svelte application using our custom server
server-run: static/css/smui.css
	@./web-ui

#? Run the svelte application using our custom server
#? restarting on any changes.
#?
server-run-watch: static/css/smui.css
	@npm run server-watch

#? Build containers
containers: container container-dev

#? Build a container image
container:
	podman build --tag $(CONTAINER_NAME):$(CONTAINER_TAG) .
	podman tag $(CONTAINER_NAME):$(CONTAINER_TAG) \
	           $(CONTAINER_NAME):latest

#? Build a developer container image
#?
container-dev:
	podman build --tag $(CONTAINER_NAME):$(CONTAINER_TAG)-dev \
	  --file Dockerfile.dev \
	    .

#? Run the production container image
container-run:
	podman run --rm -it \
	    $(CONTAINER_NAME):$(CONTAINER_TAG) sh

#? Run the developer container image
#?
container-dev-run:
	podman run --rm -it \
	    $(CONTAINER_NAME):$(CONTAINER_TAG)-dev sh

#? Push the image to the currently configured repository
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

#############################################################################
# Private (no help)
#
src/theme:
	npx smui-theme template $@

static/css/smui.css: src/theme \
	             src/theme/_smui-theme.scss \
	             src/theme/dark/_smui-theme.scss
	npm run build-theme
