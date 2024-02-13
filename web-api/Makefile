# CTX : kubectl context
# NS  : kubectl namespace
# REL : helm release
CTX	:= local
NS	:= default
REL	:= ayia
KUBECTL := kubectl --context=$(CTX) --namespace=$(NS)
HELM    := helm --kube-context=$(CTX) --namespace=$(NS)

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
server:
	npm run server

#? Create a cache an initialze with the version list
cache:
	@mkdir cache
	./etc/list-versions

#? Start a proxy to the mongodb service
mongo-proxy:
	./etc/mongo-proxy.sh "$(NS)" "$(REL)-mongodb"
