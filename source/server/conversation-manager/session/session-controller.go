package session

import (
	"conversation-manager/commontypes"
	"conversation-manager/controller"
	"io"
	"net/http"
)

const CorsAllowedOrigin string = "*" // TODO switch to stricter policy

func setupController() {
	controller.Mux.HandleFunc("/session/state", onRequestSessionStateInfo)
	controller.Mux.HandleFunc("/session/action", onSessionActionRequest)
}

func onRequestSessionStateInfo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", CorsAllowedOrigin)
	sessionId := r.URL.Query().Get("sessionId")

	session, present := sessions[sessionId]
	if !present {
		return
	}
	w.Header().Set("Content-Type", "application/json")
	sessionState := session.getSessionStateInfo()
	sesstionStateBytes, _ := sessionState.Marshal()
	w.Write(sesstionStateBytes)
}

func onSessionActionRequest(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Headers", "*")
	}
	w.Header().Set("Access-Control-Allow-Origin", CorsAllowedOrigin)
	body, err := io.ReadAll(r.Body)
	userSessionAction, err := commontypes.UnmarshalUserSessionAction(body)
	if err != nil {
		return
	}

	session, sessionActive := sessions[userSessionAction.SessionID]
	if !sessionActive {
		return
	}
	switch userSessionAction.EventName {
	case "authenticate":
		{
			session.onUserAuthenticate(userSessionAction.UserID)
		}
	case "requestToSpeak":
		{
			session.onRequestToSpeak(userSessionAction.UserID)
		}
	case "endRequestToSpeak":
		{
			session.onEndRequestToSpeak(userSessionAction.UserID)
		}
	}
}
