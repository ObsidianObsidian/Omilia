import {OmiliaSession} from "../services/omilia-session";

export class OmiliaStatusMessageMap {
    // Map<messageId, omiliaSession>
    private messageToSessionMap = new Map<string, OmiliaSession>();
    // Map<omiliaSession, messageIds>
    private sessionToMessagesMap = new Map<OmiliaSession, Set<string>>();

    public set(messageId: string, session: OmiliaSession): void {
        this.messageToSessionMap.set(messageId, session);
        if (!this.sessionToMessagesMap.has(session)) {
            this.sessionToMessagesMap.set(session, new Set<string>());
        }
        this.sessionToMessagesMap.get(session).add(messageId);
    }

    public deleteMessage(messageId: string): void {
        const omiliaSession = this.messageToSessionMap.get(messageId);
        this.messageToSessionMap.delete(messageId);
        this.sessionToMessagesMap.get(omiliaSession).delete(messageId);

        if (this.sessionToMessagesMap.get(omiliaSession).size === 0) {
            this.sessionToMessagesMap.delete(omiliaSession);
        }
    }

    public deleteSession(session: OmiliaSession): void {
        const statusMessages = this.sessionToMessagesMap.get(session);
        this.sessionToMessagesMap.delete(session);
        statusMessages.forEach((messageId) => {
            this.messageToSessionMap.delete(messageId);
        });
    }

    public getSessionFromMessageId(messageId: string): OmiliaSession {
        return this.messageToSessionMap.get(messageId);
    }

    public getActiveMessagesForSession(session: OmiliaSession): Set<string> {
        return this.sessionToMessagesMap.get(session);
    }

    public hasMessage(messageId: string): boolean {
        return this.messageToSessionMap.has(messageId);
    }

}
