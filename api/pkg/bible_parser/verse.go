package verse

type Book

const (
	Genesis 			Book = iota
	Exodus 				Book
	Leviticus 			Book
	Numbers 			Book
	Deuteronomy 		Book
	Joshua 				Book
	Judges 				Book
	Ruth 				Book
	Samuel_1 			Book
	Samuel_2 			Book
	Kings_1 			Book
	Kings_2 			Book
	Chronicles_1 		Book
	Chronicles_2 		Book
	Ezra 				Book
	Nehemiah 			Book
	Esther 				Book
	Job 				Book
	Psalms 				Book
	Proverbs 			Book
	Ecclesiastes 		Book
	Song of Songs 		Book
	Isaiah 				Book
	Jeremiah 			Book
	Lamentations 		Book
	Ezekiel 			Book
	Daniel 				Book
	Hosea 				Book
	Joel 				Book
	Amos 				Book
	Obadiah 			Book
	Jonah 				Book
	Micah 				Book
	Nahum 				Book
	Habakkuk 			Book
	Zephaniah 			Book
	Haggai 				Book
	Zechariah 			Book
	Malachi 			Book
	Matthew 			Book
	Mark 				Book
	Luke 				Book
	John 				Book
	Acts 				Book
	Romans 				Book
	Corinthians_1 		Book
	Corinthians_2 		Book
	Galatians 			Book
	Ephesians 			Book
	Philippians 		Book
	Colossians 			Book
	Thessalonians_1 	Book
	Thessalonians_2 	Book
	Timothy_1 			Book
	Timothy_2 			Book
	Titus 				Book
	Philemon 			Book
	Hebrews 			Book
	James 				Book
	Peter_1 			Book
	Peter_2 			Book
	John_1 				Book
	John_2 				Book
	John_3 				Book
	Jude 				Book
	Revelation 			Book
)

func (b Book) String() string {
	switch b {
	case Genesis:
		return "Genesis"
	case Exodus:
		return "Exodus"
	case Leviticus:
		return "Leviticus"
	case Numbers:
		return "Numbers"
	case Deuteronomy:
		return "Deuteronomy"
	case Joshua:
		return "Joshua"
	case Judges:
		return "Judges"
	case Ruth:
		return "Ruth"
	case Samuel_1:
		return "1 Samuel"
	case Samuel_2:
		return "2 Samuel"
	case Kings_1:
		return "1 Kings"
	case Kings_2:
		return "2 Kings"
	case Chronicles_1:
		return "1 Chronicles"
	case Chronicles_2:
		return "2 Chronicles"
	case Ezra:
		return "Ezra"
	case Nehemiah:
		return "Nehemiah"
	case Esther:
		return "Esther"
	case Job:
		return "Job"
	case Psalms:
		return "Psalms"
	case Proverbs:
		return "Proverbs"
	case Ecclesiastes:
		return "Ecclesiastes"
	case Song:
		return "Song"
	case Isaiah:
		return "Isaiah"
	case Jeremiah:
		return "Jeremiah"
	case Lamentations:
		return "Lamentations"
	case Ezekiel:
		return "Ezekiel"
	case Daniel:
		return "Daniel"
	case Hosea:
		return "Hosea"
	case Joel:
		return "Joel"
	case Amos:
		return "Amos"
	case Obadiah:
		return "Obadiah"
	case Jonah:
		return "Jonah"
	case Micah:
		return "Micah"
	case Nahum:
		return "Nahum"
	case Habakkuk:
		return "Habakkuk"
	case Zephaniah:
		return "Zephaniah"
	case Haggai:
		return "Haggai"
	case Zechariah:
		return "Zechariah"
	case Malachi:
		return "Malachi"
	case Matthew:
		return "Matthew"
	case Mark:
		return "Mark"
	case Luke:
		return "Luke"
	case John:
		return "John"
	case Acts:
		return "Acts"
	case Romans:
		return "Romans"
	case Corinthians_1:
		return "1 Corinthians"
	case Corinthians_2:
		return "2 Corinthians"
	case Galatians:
		return "Galatians"
	case Ephesians:
		return "Ephesians"
	case Philippians:
		return "Philippians"
	case Colossians:
		return "Colossians"
	case Thessalonians_1:
		return "1 Thessalonians"
	case Thessalonians_2:
		return "2 Thessalonians"
	case Timothy_1:
		return "1 Timothy"
	case Timothy_2:
		return "2 Timothy"
	case Titus:
		return "Titus"
	case Philemon:
		return "Philemon"
	case Hebrews:
		return "Hebrews"
	case James:
		return "James"
	case Peter_1:
		return "1 Peter"
	case Peter_2:
		return "2 Peter"
	case John_1:
		return "1 John"
	case John_2:
		return "2 John"
	case John_3:
		return "3 John"
	case Jude:
		return "Jude"
	case Revelation:
		return "Revelation"
	}
	return "unknown"
}

Books := map[string]string{
	"GEN" : "Genesis",
	"EXO" : "Exodus",
	"LEV" : "Leviticus",
	"NUM" : "Numbers",
	"DEU" : "Deuteronomy",
	"JOS" : "Joshua",
	"JDG" : "Judges",
	"RUT" : "Ruth",
	"1SA" : "1 Samuel",
	"2SA" : "2 Samuel",
	"1KI" : "1 Kings",
	"2KI" : "2 Kings",
	"1CH" : "1 Chronicles",
	"2CH" : "2 Chronicles",
	"EZR" : "Ezra",
	"NEH" : "Nehemiah",
	"EST" : "Esther",
	"JOB" : "Job",
	"PSA" : "Psalms",
	"PRO" : "Proverbs",
	"ECC" : "Ecclesiastes",
	"SNG" : "Song of Songs",
	"ISA" : "Isaiah",
	"JER" : "Jeremiah",
	"LAM" : "Lamentations",
	"EZK" : "Ezekiel",
	"DAN" : "Daniel",
	"HOS" : "Hosea",
	"JOL" : "Joel",
	"AMO" : "Amos",
	"OBA" : "Obadiah",
	"JON" : "Jonah",
	"MIC" : "Micah",
	"NAM" : "Nahum",
	"HAB" : "Habakkuk",
	"ZEP" : "Zephaniah",
	"HAG" : "Haggai",
	"ZEC" : "Zechariah",
	"MAL" : "Malachi",
	"MAT" : "Matthew",
	"MRK" : "Mark",
	"LUK" : "Luke",
	"JHN" : "John",
	"ACT" : "Acts",
	"ROM" : "Romans",
	"1CO" : "1 Corinthians",
	"2CO" : "2 Corinthians",
	"GAL" : "Galatians",
	"EPH" : "Ephesians",
	"PHP" : "Philippians",
	"COL" : "Colossians",
	"1TH" : "1 Thessalonians",
	"2TH" : "2 Thessalonians",
	"1TI" : "1 Timothy",
	"2TI" : "2 Timothy",
	"TIT" : "Titus",
	"PHM" : "Philemon",
	"HEB" : "Hebrews",
	"JAS" : "James",
	"1PE" : "1 Peter",
	"2PE" : "2 Peter",
	"1JN" : "1 John",
	"2JN" : "2 John",
	"3JN" : "3 John",
	"JUD" : "Jude",
	"REV" : "Revelation",
}


type BibleReference struct {
	Book	string	`json:"name"`
}

/**
 * NormalizeVerseReference will take a string from the user and perform various
 * transformations to attempt to understand what verse was being reference.
 */
func NormalizeBibleReference(user_input string) {
	//Separate into book vs numbers

	// determine book reference to

	//determine if numbers includes verse and/or chapter

}