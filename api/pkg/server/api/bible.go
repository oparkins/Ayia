package api

import (
	"log"
	"encoding/json"
	"fmt"
	"bibleapp.server/internal/gorm_helper"
	"bibleapp.server/internal/helpers"
	"bibleapp.server/internal/web"
	"gorm.io/gorm"
	"errors"
	"gorm.io/driver/postgres"
	"net/http"
)


func BiblesRead(w http.ResponseWriter, r *http.Request) {

	//TODO: Need to make this a global or something!
	dsn := "postgres://username:password@localhost:5432/default_database"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	var bibles []gorm_helper.Bible
	result := db.Find(&bibles)

	log.Println(fmt.Sprintf("Found %d bibles!\n", result.RowsAffected));


	var response web.GetBiblesMsg
	for _, b := range bibles {
		response.Names = append(response.Names, b.Name)
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}


func BibleRead(w http.ResponseWriter, r *http.Request) {
	
	var p web.GetBibleMsg

	err := helpers.DecodeJSONBody(w, r, &p)
    if err != nil {
        var mr *web.MalformedRequest
        if errors.As(err, &mr) {
            http.Error(w, mr.Msg, mr.Status)
        } else {
            log.Print(err.Error())
            http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
        }
        return
    }

	log.Println("Got request for bible!")

}