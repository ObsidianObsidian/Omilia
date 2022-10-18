interface SessionCreationRequest {
    requestId: string;
    users: UserProfileInfo[];
}

interface SessionCreationRequestResponse {
    sessionId: string;
}

interface UserProfileInfo {
    displayName: string;
    id: string;
    avatarURL?: string;
}

interface SocketConnectionInfo {
    sessionId: string;
}

interface UserSessionEvent {
    userId: string;
}

interface ScoresUpdateEvent {
    scores: UserScore[];
}

interface UserConnectionStatusEvent extends UserSessionEvent {
    eventName: string;
}

interface NotificationFromSessionEvent {
    eventName: string;
    eventPayload?: string;
}

interface NotificationToSessionEvent {
    eventName: string;
    eventPayload?: string;
}

interface UserScore {
    userId: string;
    score: number;
}

interface SessionStateInfo {
    connectedSpeakers: string[];
    authenticatedSpeakers: string[];
    requestsToSpeak: string[];
    userScores: UserScore[];
    sessionName: string;
}

interface DBUserProfileInfo {
    avatarUrl: string;
    displayName: string;
    userId: string;
}

interface OmiliaError {
    errorName: string;
}

