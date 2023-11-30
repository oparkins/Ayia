package gorm_helper

import (
	"gorm.io/gorm"
	"time"
)

/** From Bible_Databases Project */
type Bible_Version_Key struct {
	gorm.Model
	ID				uint
	Table           string
	Abbreviation    string
	Language        string
	Version         string
	Info_Text       string
	Info_URL        string
	Publisher       string
	Copyright       string
	Copyright_Info  string
}

/** From Bible_Databases Project */
type Cross_Reference struct {
	gorm.Model
	VID				uint
	Rank			int
	Start_Verse		int
	End_Verse		int
}

/** From Bible_Databases Project */
type Key_English struct {
	gorm.Model
	BookID			int
	BookName		string
	Testimate		string //Should probably be an enum for OT or NT
	GenreID			int
}

/** From Bible_Databases Project */
type Key_Abbreviations_English struct {
	gorm.Model
	Abbreviation	string
	BookID			int
	Prefered		bool
}

/** From Bible_Databases Project */
type Key_Genre_English struct {
	gorm.Model
	Name			string			
}

/** From Bible_Databases Project */
type T_KJV struct {
	gorm.Model
	BookID			int
	ChaperID		int
	VerseID			int
	Text			string
	Words			[]Word `gorm:"many2many:verse_words;"`
}

type Word struct {
	gorm.Model
	Word 			string
	StrongsNumber	uint
}

type Verse_Words struct {
	gorm.Model
	VerseID  		int `gorm:"primaryKey"`
	WordID 			int `gorm:"primaryKey"`
	Position		uint `gorm:"primaryKey"` //Position in the sentence
}

func SetupDB(db *gorm.DB) (ok bool) {
	err := db.SetupJoinTable(&Verse{}, "Words", &Verse_Words{})
	if err != nil {
		return false
	}
	db.AutoMigrate(
		&Bible_Version_Key{}, 
		&Cross_Reference{}, 
		&Key_English{}, 
		&Key_Abbreviations_English{}, 
		&Key_Genre_English{},
		&T_KJV{},
		&Word{},
		&Verse_Words{}
	)

	return true
}





