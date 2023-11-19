package api

import (
	"fmt"
	"net/http"
	"github.com/julienschmidt/httprouter"
	"bibleapp.server/pkg/server/handlers"
)


func Index(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	fmt.Fprintf(w, handlers.Index())
}
