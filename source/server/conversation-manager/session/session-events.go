package session

import (
	"conversation-manager/commontypes"
	"conversation-manager/events"
	"conversation-manager/messaging"
	"conversation-manager/metrics"
	"conversation-manager/scoring"
	"fmt"
	"time"

	"github.com/google/uuid"
	amqp "github.com/rabbitmq/amqp091-go"
)

func Setup() {
	setMessagingListeners()
	setupController()
}

func setMessagingListeners() {
	messaging.ListenOnExchange(messaging.ExporterExchangeName, "create_session", onSessionCreationRequest)
	messaging.ListenOnExchange(messaging.ExporterExchangeName, "session_id.*.end", onSessionEnd)
	messaging.ListenOnExchange(messaging.ExporterExchangeName, "session_id.*.speaker_id.*.connection_status.#", onUserConnectionStateUpdate)
	messaging.ListenOnExchange(messaging.ExporterExchangeName, "#.session_id.#.speaker_id.#.speaking.start", func(event amqp.Delivery) { onVoiceStateUpdate(event, true) })
	messaging.ListenOnExchange(messaging.ExporterExchangeName, "#.session_id.#.speaker_id.#.speaking.stop", func(event amqp.Delivery) { onVoiceStateUpdate(event, false) })
}

func onVoiceStateUpdate(delivery amqp.Delivery, start bool) {
	event, err := commontypes.UnmarshalUserSessionEvent(delivery.Body)
	if err != nil {
		return
	}
	session, sessionExists := sessions[event.SessionID]
	if !sessionExists {
		return
	}
	metrics, userExists := session.interventionMetrics[event.UserID]
	if !userExists {
		return
	}
	if start {
		metrics.SpeakingMetrics.RegisterStart(time.Now())
	} else {
		metrics.SpeakingMetrics.RegisterStop(time.Now())
	}
}

func onSessionCreationRequest(delivery amqp.Delivery) {
	sessionCreationRequest, err := commontypes.UnmarshalSessionCreationRequest(delivery.Body)
	if err != nil {
		return
	}
	sessionId := createSession(sessionCreationRequest)
	sessionCreationResponse := commontypes.SessionCreationRequestResponse{SessionID: sessionId}
	responseBody, _ := sessionCreationResponse.Marshal()
	messaging.PublishOnExchange(
		messaging.ConversationManagerExchangeName,
		fmt.Sprintf("create_session.%s", sessionCreationRequest.RequestID),
		responseBody,
	)
}

func onUserConnectionStateUpdate(delivery amqp.Delivery) {
	connectionStatusEvent, err := commontypes.UnmarshalUserConnectionStatusEvent(delivery.Body)
	if err != nil {
		return
	}
	session, sessionExists := sessions[connectionStatusEvent.SessionID]
	if !sessionExists {
		return
	}

	if connectionStatusEvent.EventName == "join" {
		session.onUserJoin(connectionStatusEvent.UserID)
	}
	if connectionStatusEvent.EventName == "leave" {
		session.onUserLeave(connectionStatusEvent.UserID)
	}
}

func onSessionEnd(delivery amqp.Delivery) {
	sessionEvent, err := commontypes.UnmarshalSessionEvent(delivery.Body)
	if err != nil {
		return
	}
	endSession(sessionEvent.SessionID)
}

func createSession(request commontypes.SessionCreationRequest) string {
	sessionId := uuid.New().String()
	scorer := scoring.TotalTimeScorer{}
	session := Session{
		connectedUsers:      map[string]struct{}{},
		authenticatedUsers:  map[string]struct{}{},
		requestsToSpeak:     map[string]struct{}{},
		interventionMetrics: map[string]*metrics.InterventionMetrics{},
		scorer:              scorer,
		sessionId:           sessionId,
		sessionName:         "Session",
	}

	for _, userProfileInfo := range request.Users {
		session.onUserJoin(userProfileInfo.ID)
	}
	events.CreateStream(sessionId)
	session.onSessionStart()
	sessions[sessionId] = session

	return sessionId
}

func endSession(sessionId string) {
	session, exists := sessions[sessionId]
	if exists {
		session.onSessionEnd()
		events.RemoveStream(sessionId)
		delete(sessions, sessionId)
	}
}
