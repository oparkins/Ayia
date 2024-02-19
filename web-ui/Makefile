CONTAINER_NAME	:= cmdaa/web-ui
CONTAINER_TAG	:= 0.0.25

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

#? Run a vite dev server (opening in the browser)
dev: static/css/smui.css
	@npm run dev -- --open

#? Run the svelte application in preview mode
#? (opening in the browser)
#?
preview: static/css/smui.css
	@npm run preview -- --open

#? Run the svelte application using our custom server
server-run: static/css/smui.css
	@./server.js

#? Run the svelte application using our custom server
#? restarting on any changes.
#?
server-run-watch: static/css/smui.css
	@npm run server-watch

#? Build containers
containers: container container-dev

#? Build a container image
container:
	docker build \
	  --tag $(CONTAINER_NAME):$(CONTAINER_TAG) \
	    .
	docker tag \
	  $(CONTAINER_NAME):$(CONTAINER_TAG) \
	  $(CONTAINER_NAME):latest

#? Build a developer container image
container-dev:
	docker build \
	  --file Dockerfile.dev \
	  --tag $(CONTAINER_NAME):$(CONTAINER_TAG)-dev \
	    .

#############################################################################
# Private (no help)
#
src/theme:
	npx smui-theme template $@

static/css/smui.css: src/theme \
	             src/theme/_smui-theme.scss \
	             src/theme/dark/_smui-theme.scss
	npm run build-theme
