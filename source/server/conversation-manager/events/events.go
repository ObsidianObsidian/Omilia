package events

import (
	"conversation-manager/controller"
	"net/http"

	"github.com/r3labs/sse/v2"
)

var eventsServer = sse.New()

func Setup() {
	controller.Mux.HandleFunc("/events", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		eventsServer.ServeHTTP(w, r)
	})
}

func PublishInStream(streamID, event string, data []byte) {
	if len(data) == 0 {
		data = []byte(" ")
	}
	eventsServer.Publish(streamID, &sse.Event{
		Data:  data,
		Event: []byte(event),
	})
}

func CreateStream(streamID string) {
	eventsServer.CreateStream(streamID)
}

func RemoveStream(streamID string) {
	eventsServer.RemoveStream(streamID)
}
