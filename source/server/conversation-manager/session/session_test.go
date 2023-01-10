package session

import (
	"conversation-manager/commontypes"
	"conversation-manager/testutils"
	"fmt"
	"testing"

	"github.com/google/uuid"
)

var mockUsers = []commontypes.UserProfileInfo{
	{ID: "userID_1"},
	{ID: "userID_2"},
	{ID: "userID_3"},
	{ID: "userID_4"},
	{ID: "userID_5"},
}

var mockSessionCreationRequest = commontypes.SessionCreationRequest{
	RequestID: "mockRequestId",
	Users:     mockUsers,
}

func TestCreateSession(t *testing.T) {
	sessionId := createSession(mockSessionCreationRequest)
	session, sessionFound := sessions[sessionId]
	t.Run("Session should be created and recorded in sessions", func(t *testing.T) {
		if !sessionFound {
			t.Fatalf("Session has not been recorded")
		}
	})

	t.Run("Session should register all users", func(t *testing.T) {
		for _, mockUser := range mockUsers {
			if !testUserIsProperlyRegistered(&session, mockUser.ID) {
				t.Fatalf("User missing interventions record")
			}
		}
	})
}

func TestEndSession(t *testing.T) {
	sessionId := createSession(mockSessionCreationRequest)
	endSession(sessionId)
	t.Run("Session should be deleted from sessions", func(t *testing.T) {
		_, sessionFound := sessions[sessionId]
		if sessionFound {
			t.Fatalf("Session has not been removed")
		}
	})
}

func TestOnUserLeave(t *testing.T) {
	sessionId := createSession(mockSessionCreationRequest)
	session, _ := sessions[sessionId]
	mockuser := mockUsers[0]

	session.onUserLeave(mockuser.ID)

	t.Run(fmt.Sprintf("%s should remove user from active users", testutils.GetFunctionName(session.onUserLeave)), func(t *testing.T) {
		_, userStillConsideredActive := session.connectedUsers[mockuser.ID]
		if userStillConsideredActive {
			t.Errorf("User was not removed from active users")
		}
	})

	t.Run(fmt.Sprintf("%s should not remove metrics record", testutils.GetFunctionName(session.onUserLeave)), func(t *testing.T) {
		_, userMetricsStillPresent := session.interventionMetrics[mockuser.ID]
		if !userMetricsStillPresent {
			t.Errorf("User metrics have been deleted")
		}
	})
}

func TestOnUserJoin(t *testing.T) {
	sessionId := createSession(mockSessionCreationRequest)
	session, _ := sessions[sessionId]
	t.Run(fmt.Sprintf("%s should register user", testutils.GetFunctionName(session.onUserJoin)), func(t *testing.T) {
		mockUser := commontypes.UserProfileInfo{ID: uuid.New().String()}
		session.onUserJoin(mockUser.ID)
		if !testUserIsProperlyRegistered(&session, mockUser.ID) {
			t.Fatalf("User has not been registered")
		}
	})
}

func testUserIsProperlyRegistered(session *Session, userID string) bool {
	_, inActiveUsers := session.connectedUsers[userID]
	_, hasInterventionMetrics := session.interventionMetrics[userID]
	return inActiveUsers && hasInterventionMetrics
}
