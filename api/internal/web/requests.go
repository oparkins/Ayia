package web


type MalformedRequest struct {
    Status int `json:"status"`
    Msg    string `json:"msg"`
}

func (mr *MalformedRequest) Error() string {
    return mr.Msg
}

type GetBiblesMsg struct {
    Names []string `json:"names"`
}


type GetBibleMsg struct {
    Name	string `json:"name"`
}

type GetChapterMsg struct {
    BibleID 	uint `json:"bible_id"`
	Chapter		uint `json:"chapter"`
}