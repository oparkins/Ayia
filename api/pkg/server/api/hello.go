package api

import (
	"fmt"
	"net/http"
	"github.com/julienschmidt/httprouter"
	"bibleapp.server/pkg/server/handlers"
)


func Hello(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	fmt.Fprintf(w, handlers.Hello(ps.ByName("name")))
}