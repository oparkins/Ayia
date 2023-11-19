API Design
==========

The idea is to have a REST API that servers JSON+LD and a websocket client for
most applications. The server is organized so that the same code is called
independent if a websocker request or a http request happens.

If a http request happens, the server will follow this path::

    httprouter (main.go) -> REST handler (pkg/server/api/[name].go) -> Handlers (pkg/server/handlers/[name].go)

If a websocket request happens, the server will follow this path::

    httprouter (main.go) -> Socket.IO (main.go) -> Socket.IO handler (pkg/server/socketio/server.go) -> Handlers (pkg/server/handlers/[name].go)
