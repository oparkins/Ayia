#
CTX	:= local        # kubectl context
NS	:= default      # kubectl namespace
REL	:= ayia         # helm release
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

#? Update helm dependencies
charts: Chart.yaml
	@$(HELM) dependency update 

#? Perform templating
helm-template: charts values.yaml
	@$(HELM) template $(REL) --debug --values=values.yaml .

#? Perform a dry-run install
helm-dry-run: charts values.yaml
	@$(HELM) install $(REL) --debug --dry-run --values=values.yaml .

#? Perform an install
helm-install: charts values.yaml
	@$(HELM) install $(REL) --values=values.yaml .

#? Perform an uninstall
helm-uninstall: charts values.yaml
	@$(HELM) uninstall $(REL) --values=values.yaml .

#? Package this helm chart
helm-package: charts values.yaml
	@$(HELM) package .

#? Start a proxy to the mongodb service
mongo-proxy:
	./etc/mongo-proxy.sh

#########################################################################
# Helpers with no help text
