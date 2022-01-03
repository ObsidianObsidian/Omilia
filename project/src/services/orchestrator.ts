import {Message, MessageReaction, PartialMessageReaction} from "discord.js";
import {
    HIDE_NAME_ON_SPEAKERBOARD_EMOJI,
    PAUSE_COUNTS_EMOJI,
    REQUEST_TO_SPEAK_EMOJI,
} from "../constants/interaction-constants";
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

    // tslint:disable-next-line:max-line-length
    public static onMessageReactionChange(reaction: MessageReaction | PartialMessageReaction): void {
        const targetMessageId = reaction.message.id;
        const isOmiliaEmoji =
            [
                REQUEST_TO_SPEAK_EMOJI,
                HIDE_NAME_ON_SPEAKERBOARD_EMOJI,
                PAUSE_COUNTS_EMOJI,
            ].includes(reaction.emoji.name);
        const isOnOmiliaMessage = this.statusMessageTrackerMap.hasMessage(targetMessageId);
        if (!isOmiliaEmoji || !isOnOmiliaMessage) {
            return;
        }

        const session = this.statusMessageTrackerMap.getSessionFromMessageId(reaction.message.id);
        reaction.users.fetch().then((users) => {
            const usersWhoReacted = users.filter((user) => !user.bot).map((user) => user.id);
            switch (reaction.emoji.name) {
                case REQUEST_TO_SPEAK_EMOJI:
                    session.setCandidateSpeakers(usersWhoReacted);
                    break;
                case HIDE_NAME_ON_SPEAKERBOARD_EMOJI:
                    session.setHiddenSpeakers(usersWhoReacted);
                    break;
                case PAUSE_COUNTS_EMOJI:
                    session.onPrivilegedSpeakersChange(usersWhoReacted);
            }

        });
    }

    private static registerNewSession(session: OmiliaSession): void {
        this.sessions.set(session.getGuildId(), session);
        for (const statusMessageId of session.getStatusMessagesIds()) {
            this.statusMessageTrackerMap.set(statusMessageId, session);
        }
    }
}
