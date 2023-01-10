package session

import (
	"conversation-manager/commontypes"
	"conversation-manager/events"
	"conversation-manager/metrics"
	"conversation-manager/scoring"
	"time"
)

var sessions = map[string]Session{}

type Session struct {
	authenticatedUsers  map[string]struct{}
	connectedUsers      map[string]struct{}
	requestsToSpeak     map[string]struct{}
	sessionName         string
	interventionMetrics map[string]*metrics.InterventionMetrics
	scorer              scoring.Scorer
	sessionId           string
	mostRecentScores    []commontypes.UserScore
}

func (session *Session) onSessionEnd() {
	session.notify("sessionEnded", []byte{})
}

func (session *Session) onSessionStart() {
	session.mostRecentScores = session.computeUserScores()
	go func() {
		for {
			time.Sleep(time.Second * 5)
			session.mostRecentScores = session.computeUserScores()
			scores := commontypes.ScoresUpdateEvent{
				Scores: session.mostRecentScores,
			}
			body, _ := scores.Marshal()
			session.notify("userScoresUpdate", body)
		}
	}()
}

func (session *Session) onUserJoin(userID string) {
	session.connectedUsers[userID] = struct{}{}
	userMetrics, ok := session.interventionMetrics[userID]
	if !ok {
		session.interventionMetrics[userID] = &metrics.InterventionMetrics{}
		userMetrics = session.interventionMetrics[userID]
	}
	userMetrics.PresenceMetrics.RegisterStart(time.Now())
	event := commontypes.UserConnectionStatusEvent{
		EventName: "userJoin",
		SessionID: session.sessionId,
		UserID:    userID,
	}
	body, _ := event.Marshal()
	session.notify("userJoin", body)
}

func (session *Session) onUserLeave(userID string) {
	userMetrics, _ := session.interventionMetrics[userID]
	now := time.Now()
	userMetrics.PresenceMetrics.RegisterStop(now)
	userMetrics.SpeakingMetrics.RegisterStop(now)

	event := commontypes.UserConnectionStatusEvent{
		EventName: "userLeave",
		SessionID: session.sessionId,
		UserID:    userID,
	}
	body, _ := event.Marshal()
	session.notify("userLeave", body)
	delete(session.connectedUsers, userID)
}

func (session *Session) onUserAuthenticate(userID string) {
	_, userAlreadyAuthenticated := session.authenticatedUsers[userID]
	if userAlreadyAuthenticated {
		return
	}
	session.authenticatedUsers[userID] = struct{}{}
	sessionEvent := commontypes.UserSessionEvent{
		SessionID: session.sessionId,
		UserID:    userID,
	}
	body, _ := sessionEvent.Marshal()
	session.notify("authentication", body)
}

func (session *Session) onRequestToSpeak(userID string) {
	session.authenticatedUsers[userID] = struct{}{}
	sessionEvent := commontypes.UserSessionEvent{
		SessionID: session.sessionId,
		UserID:    userID,
	}
	_, ongoingRequestToSpeak := session.requestsToSpeak[userID]
	if ongoingRequestToSpeak {
		return
	}
	session.requestsToSpeak[userID] = struct{}{}
	body, _ := sessionEvent.Marshal()
	session.notify("requestToSpeak", body)
}

func (session *Session) onEndRequestToSpeak(userID string) {
	session.authenticatedUsers[userID] = struct{}{}
	sessionEvent := commontypes.UserSessionEvent{
		SessionID: session.sessionId,
		UserID:    userID,
	}
	_, ongoingRequestToSpeak := session.requestsToSpeak[userID]
	if !ongoingRequestToSpeak {
		return
	}
	delete(session.requestsToSpeak, userID)
	body, _ := sessionEvent.Marshal()
	session.notify("endRequestToSpeak", body)
}

func (session *Session) notify(event string, data []byte) {
	events.PublishInStream(session.sessionId, event, data)
}

func (session *Session) getSessionStateInfo() commontypes.SessionStateInfo {
	return commontypes.SessionStateInfo{
		AuthenticatedSpeakers: getKeysFromMap(session.authenticatedUsers),
		ConnectedSpeakers:     getKeysFromMap(session.connectedUsers),
		RequestsToSpeak:       getKeysFromMap(session.requestsToSpeak),
		SessionName:           session.sessionName,
		UserScores:            session.mostRecentScores,
	}
}

func (session *Session) computeUserScores() []commontypes.UserScore {
	scores := make([]commontypes.UserScore, len(session.connectedUsers))
	i := 0
	for id, metrics := range session.interventionMetrics {
		scores[i] = commontypes.UserScore{
			UserID: id,
			Score:  session.scorer.ComputeScore(metrics),
		}
		i++
	}
	return scores
}

func getKeysFromMap[K comparable, T any](m map[K]T) []K {
	keys := make([]K, len(m))
	i := 0
	for k := range m {
		keys[i] = k
		i++
	}
	return keys
}
