package gorm_helper

import (
	"gorm.io/gorm"
	"time"
)

type Bible struct {
	gorm.Model
	Description 	string
	Name			string
	Books			[]Book
}

type Book struct {
	gorm.Model
	Name 			string
	Author			string
	ShortName		string
	Chapters		[]Chapter
	Position		uint
	BibleID			uint
}

type Chapter struct {
	gorm.Model
	Number			uint
	Verses			[]Verse
	BookID			uint
}

type Verse struct {
	gorm.Model
	Number			uint
	Words			[]Word `gorm:"many2many:verse_words;"`
	Text			string
	ChapterID		uint
	
}

type Word struct {
	gorm.Model
	Word 			string
}

type VerseWord struct {
	VerseID  		int `gorm:"primaryKey"`
	WordID 			int `gorm:"primaryKey"`
	Position		uint `gorm:"primaryKey"` //Position in the sentence
	CreatedAt time.Time
	DeletedAt gorm.DeletedAt
}

func SetupDB(db *gorm.DB) (ok bool) {
	err := db.SetupJoinTable(&Verse{}, "Words", &VerseWord{})
	if err != nil {
		return false
	}
	db.AutoMigrate(&Bible{}, &Book{}, &Chapter{}, &Verse{}, &Word{}, &VerseWord{})

	return true

}





