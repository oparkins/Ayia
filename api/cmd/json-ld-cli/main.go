package main

import (
	"log"
	"fmt"
	"bufio"
	"regexp"
	"os"
	"strings"
	"flag"
	"github.com/piprate/json-gold/ld"
	"bibleapp.server/internal/helpers"
	"bibleapp.server/internal/gorm_helper"
	"gorm.io/gorm"
	"gorm.io/driver/postgres"
)


func main() {

    inFilenamePtr := flag.String("in", "", "Input filename")
	outFilenamePtr := flag.String("out", "", "Output filename")

    flag.Parse()

	if (*inFilenamePtr == "" || *outFilenamePtr == "") {
		log.Println("usage: ./converter -in [infile] -out [outfile]")
		return; 
	}


	dsn := "postgres://username:password@localhost:5432/default_database"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	ok := gorm_helper.SetupDB(db)
	if !ok {
		panic("Something bad happened when setting up the database.")
	}

    // Here we'll just dump out the parsed options and
    // any trailing positional arguments. Note that we
    // need to dereference the pointers with e.g. `*wordPtr`
    // to get the actual option values.
    log.Println(fmt.Sprintf("Converting %s to %s", *inFilenamePtr, *outFilenamePtr));






	readFile, err := os.Open(*inFilenamePtr)
	if err != nil {
		log.Println(err)
		return
	}
	fileScanner := bufio.NewScanner(readFile)

	fileScanner.Split(bufio.ScanLines)



	json_context := map[string]interface{}{
		"@context": "https://schema.org",
	}


	tabSplitReg := regexp.MustCompile(`\t`)


	type Word struct {
		Context string `json:"@context"`
		Type []string `json:"@type"`
		ID string `json:"@id"`
		Word []string `json:"text"`
	}

	type Verse struct {
		Context string `json:"@context"`
		Type []string `json:"@type"`
		ID string `json:"@id"`
		Text []string `json:"text"`

	}

	type Chapter struct {
		Context string `json:"@context"`
		Type []string `json:"@type"`
		VolumeNumber int `json:"volumeNumber"`
		ID string `json:"@id"`
		Name string `json:"name"`
		IsPartOf string `json:"isPartOf"`
	}

	type Book struct {
		Context string `json:"@context"`
		Type []string `json:"@type"`
		VolumeNumber int `json:"volumeNumber"`
		ID string `json:"@id"`
		Name string `json:"name"`
		IsPartOf string `json:"isPartOf"`
	}

	books := map[string]*Book{}
	

	for fileScanner.Scan() {

		line := tabSplitReg.Split(fileScanner.Text(), '\t')
		if (len(line) != 2) {
			continue
		}
		log.Println(fmt.Sprintf("Processing: %s", line))
		// Figure out the location
		rev_raw_location := helpers.Reverse(line[0])

		found := false
		verse_num_rev, chapter_num_title, found := strings.Cut(rev_raw_location, ":")
		if (!found) {
			log.Println(fmt.Sprintf("Did not find split in %s!", rev_raw_location))
			continue
		}
		verse_num := helpers.Reverse(verse_num_rev)
		chapter_num_rev, book_rev, found1 := strings.Cut(chapter_num_title, " ")
		chapter_num := helpers.Reverse(chapter_num_rev)
		if (!found1) {
			log.Println("Did not find split!")
			continue
		}

		book := helpers.Reverse(book_rev)

		text := line[1]

		log.Println(fmt.Sprintf("Book: %s\tChapter: %s\tVerse: %s\tText: %s\n", book, chapter_num, verse_num, text))
		
		_, ok := books[book]
		// If the key exists
		if !ok {
			books[book] = &Book{
				Context: "https://schema.org",
				Type: []string{"Book", "PublicationVolume"},
				VolumeNumber: 1,
				ID: fmt.Sprintf("#%s", strings.ReplaceAll(strings.ToLower(book), " ", "_")),
				Name: book,
				IsPartOf: "#kjv",
			}
		}


		// Get the chapter or create it

		// chapter 
		/*chapter := map[string]interface{}{
			"@context": "https://schema.org",
			"@type": []string { "Book", "PublicationVolume" },
			"description": "King James Bible: Pure Cambridge Edition",
			"inLanguage": "en-US",
			"name": "King James Bible",
			"@id": "#kjv",
			"hasPart": []string{},
		}*/
	}

	readFile.Close()

/*
	"@context": []interface{}{
		map[string]interface{}{
			"name": "http://xmlns.com/foaf/0.1/name",
			"homepage": map[string]interface{}{
				"@id":   "http://xmlns.com/foaf/0.1/homepage",
				"@type": "@id",
			},
		},
		map[string]interface{}{
			"ical": "http://www.w3.org/2002/12/cal/ical#",
		},
	},*/

	books_array := []*Book{}
	for _, v := range books { 
		books_array = append(books_array, v)
	}
		
	// Bible Setup
	bible := map[string]interface{}{
		"@context": "https://schema.org",
		"@type": "Book",
        "description": "King James Bible: Pure Cambridge Edition",
        "inLanguage": "en-US",
        "name": "King James Bible",
        "@id": "#kjv",
		"hasPart": books_array,
	}


	proc := ld.NewJsonLdProcessor()
	options := ld.NewJsonLdOptions("")

	compactedDoc, err := proc.Compact(bible, json_context, options)
	if err != nil {
		panic(err)
	}

	ld.PrintDocument("JSON-LD compation succeeded", compactedDoc)

	return;
}
