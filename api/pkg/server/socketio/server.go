package socketio

import (
	"fmt"
	sio "github.com/googollee/go-socket.io"
)


func AddHandlers(server *sio.Server) {

	server.OnConnect("/", func(s sio.Conn) error {
		s.SetContext("")
		fmt.Println("connected:", s.ID())
		return nil
	})

	server.OnEvent("/", "notice", func(s sio.Conn, msg string) {
		fmt.Println("notice:", msg)
		s.Emit("reply", "have "+msg)
	})

	server.OnEvent("/get", "msg", func(s sio.Conn, msg string) string {
		s.SetContext(msg)
		return "recv " + msg
	})

	server.OnEvent("/", "bye", func(s sio.Conn) string {
		last := s.Context().(string)
		s.Emit("bye", last)
		s.Close()
		return last
	})

	server.OnError("/", func(s sio.Conn, e error) {
		// server.Remove(s.ID())
		fmt.Println("meet error:", e)
	})

	server.OnDisconnect("/", func(s sio.Conn, reason string) {
		// Add the Remove session id. Fixed the connection & mem leak
		//server.Remove(s.ID())
		fmt.Println("closed", reason)
	})
}