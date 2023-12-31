package main

import (
	"bibleapp.server/internal/dbmodels"
	"gorm.io/gorm"
	"gorm.io/driver/postgres"
	"github.com/rs/zerolog/log"
	"encoding/json"
	"io/ioutil"
	"fmt"
)


type T_BIBLE struct {
	ResultSet struct {
		Row [] struct {
			Field []interface{} `json:"field"`
		} `json:"row"`
	} `json:"resultset"`
}


/**
 * Takes an json file as input and connects to a database to import
 * the json file 
 */
func main() {

	/** Files to import */
    // bible_version_key_file := "../../../data/bible_version_key.json"
	// key_english_file := "../../../data/key_english.json"
	t_asv_file := "../docs/resources/t_kjv.json"
	// t_kjv_file := "../../../data/t_kjv.json"
	// t_ylt_file := "../../../data/t_ylt.json"
	// key_abbreviations_english_file := "../../../data/key_abbreviations_english.json"
	// key_genre_english_file := "../../../data/key_genre_english.json"
	// t_bbe_file := "../../../data/t_bbe."
	// t_web_file := "../../../data/t_web.json"

	log.Info().Msg("Starting Ayia...")
	log.Info().Msg("Connecting to Database..")

	dsn := "postgres://username:password@172.17.0.4:5432/default_database"
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect database")
	}

	log.Info().Msg("Setting up Database...")

	ok := dbmodels.SetupDB(db)
	if !ok {
		panic("Something bad happened when setting up the database.")
	}

	 // Let's first read the `config.json` file
	 content, err := ioutil.ReadFile(t_asv_file)
	 if err != nil {
		 log.Fatal().Err(err).Msg("Error when opening file: ")
	 }
  
	 // Now let's unmarshall the data into `payload`
	 var payload T_BIBLE
	 err = json.Unmarshal(content, &payload)
	 if err != nil {
		 log.Fatal().Err(err).Msg("Error during Unmarshal(): ")
	 }
  
	for _, row := range payload.ResultSet.Row {
	 	log.Info().Msg(fmt.Sprintf("%f", row.Field[0].(float64)))
	}




    // Here we'll just dump out the parsed options and
    // any trailing positional arguments. Note that we
    // need to dereference the pointers with e.g. `*wordPtr`
    // to get the actual option values.
    /*log.Println(fmt.Sprintf("Importing %s", *inFilenamePtr));

	bible := dbmodels.Bible{
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
		var bookDB dbmodels.Book 

		bookID, ok := bible_model_map[book]
		var exists bool


		if !ok {
			err = db.Model(&dbmodels.Book{}).
					Select("count(*) > 0").
					Where("Name = ?", book).
					Find(&exists).
					Error
			if errors.Is(err, gorm.ErrRecordNotFound) {
				panic("Error happened!")
			}
			if !exists {
				log.Println("Creating new book!")
				db.Create(&dbmodels.Book{
					Name: book,
					ShortName: "TBD",
					Position: 0,
					BibleID: bible.ID,
				})
			}
			db.Model(&dbmodels.Book{}).First(&bookDB, "name = ?", book)
			bookID = bookDB.ID
		}


		//============= CHAPTER ==================
		err = db.Model(&dbmodels.Chapter{}).
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
			db.Create(&dbmodels.Chapter{
				Number: uint(chapter_n),
				BookID: bookID,
			})
		}
		var chapterDB dbmodels.Chapter
		db.Model(&dbmodels.Chapter{}).First(&chapterDB, "Number = ? and chapters.book_id = ?", uint(chapter_n), bookID)


		db.Transaction(func(tx *gorm.DB) error {

		

			//============== VERSE ==================
			verse_n, err := strconv.ParseUint(verse_num, 10, 32)
			verseDB := dbmodels.Verse {
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
				err = db.Model(&dbmodels.Word{}).
					Select("count(*) > 0").
					Where("Word = ?", word).
					Find(&exists).
					Error
				if errors.Is(err, gorm.ErrRecordNotFound) {
					panic("Error happened!")
				}
				wordDB := dbmodels.Word {
					Word: word,
				}
				if !exists {
					db.Create(&wordDB)
				} else {
					db.Model(&dbmodels.Word{}).First(&wordDB, "Word = ?", word)
				}

				//We have a word. Now let's link it to the verse. 
				linkDB := dbmodels.VerseWord {
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
		}
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