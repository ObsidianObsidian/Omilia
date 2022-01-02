import {Message, MessageReaction, PartialMessageReaction} from "discord.js";
import {REQUEST_TO_SPEAK_EMOJI, REQUEST_TO_SPEAK_EMOJI_NAME} from "../constants/interaction-constants";
import {AlreadyDisconnectedError, notifyOmiliaError, SessionAlreadyActiveError} from "../constants/omilia-error";
import {SessionSettings} from "../interfaces/session-settings";
import {OmiliaStatusMessageMap} from "../utils/omilia-status-message-map";
import {OmiliaSession} from "./omilia-session";

export class Orchestrator {

    // Map<GuildID, Session>
    // tslint:disable:member-ordering
    private static sessions = new Map<string, OmiliaSession>();
    // Map<messageId, owner Omilia session>
    private static statusMessageTrackerMap = new OmiliaStatusMessageMap();

    public static startSession(activationMessage: Message, sessionSettings: SessionSettings): void {
        if (Orchestrator.sessions.has(activationMessage.guildId)) {
            throw new SessionAlreadyActiveError();
        }

        const session = new OmiliaSession(activationMessage);
        session.start(sessionSettings).then(() => {
            const sub = session.getEndObservable().subscribe(() => {
                Orchestrator.onSessionEnd(session);
                sub.unsubscribe();
            });
            this.registerNewSession(session);
        }, (error) => {
            notifyOmiliaError(error, activationMessage.channel);
        });
    }

    public static stopSession(guildId: string): void {
        if (!this.sessions.has(guildId)) {
            throw new AlreadyDisconnectedError();
        }
        this.sessions.get(guildId).end();
    }

    public static onSessionEnd(session: OmiliaSession) {
        this.sessions.delete(session.getGuildId());
        this.statusMessageTrackerMap.deleteSession(session);
    }

    public static onMessageReaction(reaction: MessageReaction | PartialMessageReaction): void {
        const targetMessageId = reaction.message.id;
        const isOmiliaEmoji = [REQUEST_TO_SPEAK_EMOJI, REQUEST_TO_SPEAK_EMOJI_NAME].includes(reaction.emoji.name);
        const isOnOmiliaMessage = this.statusMessageTrackerMap.hasMessage(targetMessageId);
        if (!isOmiliaEmoji || !isOnOmiliaMessage) {
            return;
        }

        const session = this.statusMessageTrackerMap.getSessionFromMessageId(reaction.message.id);
        reaction.users.fetch().then((users) => {
            session.setCandidateSpeakers(users.filter((user) => !user.bot).map((user) => user.id));
        });
    }

    private static registerNewSession(session: OmiliaSession): void {
        this.sessions.set(session.getGuildId(), session);
        for (const statusMessageId of session.getStatusMessagesIds()) {
            this.statusMessageTrackerMap.set(statusMessageId, session);
        }
    }
}
