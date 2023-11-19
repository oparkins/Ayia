package main

import (
	"log"
	"fmt"
	"bufio"
	"regexp"
	"os"
	"strings"
	"flag"
	"bibleapp.server/internal/helpers"
	"bibleapp.server/internal/gorm_helper"
	"gorm.io/gorm"
	"gorm.io/driver/postgres"
	"strconv"
	"errors"
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

	bible := gorm_helper.Bible{
		Name: "kjv",
		Description: "King James Version",
	}

	db.Create(&bible)

	readFile, err := os.Open(*inFilenamePtr)
	if err != nil {
		log.Println(err)
		return
	}
	fileScanner := bufio.NewScanner(readFile)

	fileScanner.Split(bufio.ScanLines)


	tabSplitReg := regexp.MustCompile(`\t`)

	var bible_model_map map[string]uint

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

		// Check if book exists
		var bookDB gorm_helper.Book 

		bookID, ok := bible_model_map[book]
		var exists bool


		if !ok {
			err = db.Model(&gorm_helper.Book{}).
					Select("count(*) > 0").
					Where("Name = ?", book).
					Find(&exists).
					Error
			if errors.Is(err, gorm.ErrRecordNotFound) {
				panic("Error happened!")
			}
			if !exists {
				log.Println("Creating new book!")
				db.Create(&gorm_helper.Book{
					Name: book,
					ShortName: "TBD",
					Position: 0,
					BibleID: bible.ID,
				})
			}
			db.Model(&gorm_helper.Book{}).First(&bookDB, "name = ?", book)
			bookID = bookDB.ID
		}


		//============= CHAPTER ==================
		err = db.Model(&gorm_helper.Chapter{}).
				Select("count(*) > 0").
				Where("Number = ? and chapters.book_id = ?", chapter_num, bookID).
				Find(&exists).
				Error
		if errors.Is(err, gorm.ErrRecordNotFound) {
			panic("Error happened!")
		}
		chapter_n, err := strconv.ParseUint(chapter_num, 10, 32)
		if err != nil {
			panic("Could not convert")
		}
		if !exists {
			log.Println("Creating new book!")
			db.Create(&gorm_helper.Chapter{
				Number: uint(chapter_n),
				BookID: bookID,
			})
		}
		var chapterDB gorm_helper.Chapter
		db.Model(&gorm_helper.Chapter{}).First(&chapterDB, "Number = ? and chapters.book_id = ?", uint(chapter_n), bookID)


		db.Transaction(func(tx *gorm.DB) error {

		

			//============== VERSE ==================
			verse_n, err := strconv.ParseUint(verse_num, 10, 32)
			verseDB := gorm_helper.Verse {
				Number: uint(verse_n),
				//Words: 
				Text: text,
				ChapterID: chapterDB.ID,
			}
			db.Create(&verseDB)



			// Split the text
			replacer := strings.NewReplacer(",", "", ".", "", ";", "", "[", "]")
			text = replacer.Replace(text)
			words := strings.Fields(text)
			for i, word := range words {
				//fmt.Println(i, " => ", word)


				// Does this word exist in the database?
				err = db.Model(&gorm_helper.Word{}).
					Select("count(*) > 0").
					Where("Word = ?", word).
					Find(&exists).
					Error
				if errors.Is(err, gorm.ErrRecordNotFound) {
					panic("Error happened!")
				}
				wordDB := gorm_helper.Word {
					Word: word,
				}
				if !exists {
					db.Create(&wordDB)
				} else {
					db.Model(&gorm_helper.Word{}).First(&wordDB, "Word = ?", word)
				}

				//We have a word. Now let's link it to the verse. 
				linkDB := gorm_helper.VerseWord {
					VerseID: int(verseDB.ID),
					WordID: int(wordDB.ID),
					Position: uint(i),
				}
				db.Create(&linkDB)	
			}

			return nil
		})

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
/**
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
*/
	return;
}


/**
* References:
https://github.com/1John419/kjs/tree/master/json

https://crosswire.org/sword/servlet/SwordMod.Verify?modName=KJV&pkgType=raw
https://crosswire.org/sword/servlet/SwordMod.Verify?modName=StrongsGreek&pkgType=raw
https://crosswire.org/sword/servlet/SwordMod.Verify?modName=StrongsHebrew&pkgType=raw


*/