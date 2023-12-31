package models

import (
	"gorm.io/gorm"
	"time"
)

type BibleVerseKey struct {
	Table			string
	Abbreviation	string
	Language		string
	Version			string
	InfoText		string
	InfoURL			string
	Publisher		string
	Copyright		string
	CopyrightInfo	string
}

type CrossReference struct {
	VID				uint
	Rank			int
	StartVerse		uint
	EndVerse		uint
}

type TestamentType byte

const (
	TESTAMENT_OLD 	TestamentType	= 0
	TESTAMENT_NEW	TestamentType	= 1
)

type KeyEnglish struct {
	Book			int
	Name			string
	Testament		TestamentType
	GenreID			int
}

type KeyAbbreviationsEnglish struct {
	ID				int
	Abbreviation	string
	BookID			int
	Prefered		bool
}

type KeyGenreEnglish struct {
	GenreID			int
	Name			string
}


type Word struct {
	Word 			string
}

type VerseWord struct {
	VerseID  		int `gorm:"primaryKey"`
	WordID 			int `gorm:"primaryKey"`
	Position		uint `gorm:"primaryKey"` //Position in the sentence
	CreatedAt time.Time
	DeletedAt gorm.DeletedAt
}
