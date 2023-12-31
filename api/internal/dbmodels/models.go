package dbmodels

import (
	"gorm.io/gorm"
	"bibleapp.server/internal/models"
)

type BibleVerseKey struct {
	gorm.Model
	models.BibleVerseKey
}

type CrossReference struct {
	gorm.Model
	models.CrossReference
} 

type KeyEnglish struct {
	gorm.Model
	models.KeyEnglish
}

type KeyAbbreviationsEnglish struct {
	gorm.Model
	models.KeyAbbreviationsEnglish
}

type KeyGenreEnglish struct {
	gorm.Model
	models.KeyGenreEnglish
}

type Verse struct {
	gorm.Model
	Number			uint
	Text			string
	Words			[]Word `gorm:"many2many:verse_words;"`
}

type Word struct {
	gorm.Model
	models.Word
}

type VerseWord struct {
	gorm.Model
	models.VerseWord
}

func SetupDB(db *gorm.DB) (ok bool) {
	err := db.SetupJoinTable(&Verse{}, "Words", &VerseWord{})
	if err != nil {
		return false
	}
	db.AutoMigrate(
		&BibleVerseKey{}, 
		&CrossReference{},
		&KeyEnglish{},
		&KeyAbbreviationsEnglish{},
		&KeyGenreEnglish{},
		&Word{},
		&Verse{},
	)

	return true

}





