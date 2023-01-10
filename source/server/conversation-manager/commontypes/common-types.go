// This file was generated from JSON Schema using quicktype, do not modify it directly.
// To parse and unparse this JSON data, add this code to your project and do:
//
//    sessionCreationRequest, err := UnmarshalSessionCreationRequest(bytes)
//    bytes, err = sessionCreationRequest.Marshal()
//
//    sessionCreationRequestResponse, err := UnmarshalSessionCreationRequestResponse(bytes)
//    bytes, err = sessionCreationRequestResponse.Marshal()
//
//    userProfileInfo, err := UnmarshalUserProfileInfo(bytes)
//    bytes, err = userProfileInfo.Marshal()
//
//    socketConnectionInfo, err := UnmarshalSocketConnectionInfo(bytes)
//    bytes, err = socketConnectionInfo.Marshal()
//
//    userSessionEvent, err := UnmarshalUserSessionEvent(bytes)
//    bytes, err = userSessionEvent.Marshal()
//
//    userSessionAction, err := UnmarshalUserSessionAction(bytes)
//    bytes, err = userSessionAction.Marshal()
//
//    scoresUpdateEvent, err := UnmarshalScoresUpdateEvent(bytes)
//    bytes, err = scoresUpdateEvent.Marshal()
//
//    userConnectionStatusEvent, err := UnmarshalUserConnectionStatusEvent(bytes)
//    bytes, err = userConnectionStatusEvent.Marshal()
//
//    sessionEvent, err := UnmarshalSessionEvent(bytes)
//    bytes, err = sessionEvent.Marshal()
//
//    notificationFromSessionEvent, err := UnmarshalNotificationFromSessionEvent(bytes)
//    bytes, err = notificationFromSessionEvent.Marshal()
//
//    notificationToSessionEvent, err := UnmarshalNotificationToSessionEvent(bytes)
//    bytes, err = notificationToSessionEvent.Marshal()
//
//    userScore, err := UnmarshalUserScore(bytes)
//    bytes, err = userScore.Marshal()
//
//    sessionStateInfo, err := UnmarshalSessionStateInfo(bytes)
//    bytes, err = sessionStateInfo.Marshal()
//
//    dBUserProfileInfo, err := UnmarshalDBUserProfileInfo(bytes)
//    bytes, err = dBUserProfileInfo.Marshal()
//
//    omiliaError, err := UnmarshalOmiliaError(bytes)
//    bytes, err = omiliaError.Marshal()

package commontypes

import "encoding/json"

func UnmarshalSessionCreationRequest(data []byte) (SessionCreationRequest, error) {
	var r SessionCreationRequest
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *SessionCreationRequest) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalSessionCreationRequestResponse(data []byte) (SessionCreationRequestResponse, error) {
	var r SessionCreationRequestResponse
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *SessionCreationRequestResponse) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalUserProfileInfo(data []byte) (UserProfileInfo, error) {
	var r UserProfileInfo
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *UserProfileInfo) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalSocketConnectionInfo(data []byte) (SocketConnectionInfo, error) {
	var r SocketConnectionInfo
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *SocketConnectionInfo) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalUserSessionEvent(data []byte) (UserSessionEvent, error) {
	var r UserSessionEvent
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *UserSessionEvent) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalUserSessionAction(data []byte) (UserSessionAction, error) {
	var r UserSessionAction
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *UserSessionAction) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalScoresUpdateEvent(data []byte) (ScoresUpdateEvent, error) {
	var r ScoresUpdateEvent
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *ScoresUpdateEvent) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalUserConnectionStatusEvent(data []byte) (UserConnectionStatusEvent, error) {
	var r UserConnectionStatusEvent
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *UserConnectionStatusEvent) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalSessionEvent(data []byte) (SessionEvent, error) {
	var r SessionEvent
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *SessionEvent) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalNotificationFromSessionEvent(data []byte) (NotificationFromSessionEvent, error) {
	var r NotificationFromSessionEvent
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *NotificationFromSessionEvent) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalNotificationToSessionEvent(data []byte) (NotificationToSessionEvent, error) {
	var r NotificationToSessionEvent
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *NotificationToSessionEvent) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalUserScore(data []byte) (UserScore, error) {
	var r UserScore
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *UserScore) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalSessionStateInfo(data []byte) (SessionStateInfo, error) {
	var r SessionStateInfo
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *SessionStateInfo) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalDBUserProfileInfo(data []byte) (DBUserProfileInfo, error) {
	var r DBUserProfileInfo
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *DBUserProfileInfo) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

func UnmarshalOmiliaError(data []byte) (OmiliaError, error) {
	var r OmiliaError
	err := json.Unmarshal(data, &r)
	return r, err
}

func (r *OmiliaError) Marshal() ([]byte, error) {
	return json.Marshal(r)
}

type SessionCreationRequest struct {
	RequestID string            `json:"requestId"`
	Users     []UserProfileInfo `json:"users"`    
}

type UserProfileInfo struct {
	AvatarURL   *string `json:"avatarURL,omitempty"`
	DisplayName string  `json:"displayName"`        
	ID          string  `json:"id"`                 
}

type SessionCreationRequestResponse struct {
	SessionID string `json:"sessionId"`
}

type SocketConnectionInfo struct {
	SessionID string `json:"sessionId"`
}

type UserSessionEvent struct {
	SessionID string `json:"sessionId"`
	UserID    string `json:"userId"`   
}

type UserSessionAction struct {
	EventName string `json:"eventName"`
	SessionID string `json:"sessionId"`
	UserID    string `json:"userId"`   
}

type ScoresUpdateEvent struct {
	Scores []UserScore `json:"scores"`
}

type UserScore struct {
	Score  float64 `json:"score"` 
	UserID string  `json:"userId"`
}

type UserConnectionStatusEvent struct {
	EventName string `json:"eventName"`
	SessionID string `json:"sessionId"`
	UserID    string `json:"userId"`   
}

type SessionEvent struct {
	SessionID string `json:"sessionId"`
}

type NotificationFromSessionEvent struct {
	EventName    string  `json:"eventName"`             
	EventPayload *string `json:"eventPayload,omitempty"`
}

type NotificationToSessionEvent struct {
	EventName    string  `json:"eventName"`             
	EventPayload *string `json:"eventPayload,omitempty"`
}

type SessionStateInfo struct {
	AuthenticatedSpeakers []string    `json:"authenticatedSpeakers"`
	ConnectedSpeakers     []string    `json:"connectedSpeakers"`    
	RequestsToSpeak       []string    `json:"requestsToSpeak"`      
	SessionName           string      `json:"sessionName"`          
	UserScores            []UserScore `json:"userScores"`           
}

type DBUserProfileInfo struct {
	AvatarURL   string `json:"avatarUrl"`  
	DisplayName string `json:"displayName"`
	UserID      string `json:"userId"`     
}

type OmiliaError struct {
	ErrorName string `json:"errorName"`
}
