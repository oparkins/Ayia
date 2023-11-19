package main

import (
	"log"
	"fmt"
	"net/http"
	env "bibleapp.server/internal/env_helper"
	sio "github.com/googollee/go-socket.io"
	"github.com/julienschmidt/httprouter"
	api "bibleapp.server/pkg/server/api"
	sio_helper "bibleapp.server/pkg/server/socketio"

)

func main() {

	log.Print("Bible API Server");
	port := env.GetEnv("port", "8080");

	router := httprouter.New()

	// Normal routing
    router.GET("/", api.Index)
    router.GET("/hello/:name", api.Hello)
	router.HandlerFunc(http.MethodGet, "/bibles/", api.BiblesRead)

	// Socket.io setup
	server := sio.NewServer(nil)
	sio_helper.AddHandlers(server)
	go server.Serve()
	defer server.Close()
	router.Handler(http.MethodGet, "/socket.io/", server)

	s := fmt.Sprintf("Serving at localhost:%s...", port)
	log.Println(s)
	log.Fatal(http.ListenAndServe(fmt.Sprintf(":%s", port), router))
	return;
}
