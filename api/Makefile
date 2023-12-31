
all: build

build: build/importer build/server

build/%: cmd/%/main.go pkg/**/*.go internal/**/*.go
	go build -o $@ $<

run-converter: build/converter
	./build/converter -in ../kjv.txt -out ../kjv.json

run-server: build/server
	./build/server