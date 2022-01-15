import {
    COMMAND_PREFIX, DETAILS_CMD,
    HELP_CMD,
    LEAVE_CMD, SCORING_MODE, SCORING_MODE_TO_ARG,
    START_MONITORING_CMD, STATUS_MESSAGE_REFRESH_DELAY,
    STOP_CMD,
    TIME_WINDOW_DURATION, TOTAL_TIME_SCORE_ARG, VOICE_PRESENCE_SCORE_ARG,
} from "../constants/command-constants";
import {DEPENDENCIES, REPO_URL} from "../constants/info-constants";
import {
    HIDE_IN_SPEAKER_BOARD_EMOJI,
    PAUSE_COUNTS_EMOJI,
    REQUEST_TO_SPEAK_EMOJI,
} from "../constants/interaction-constants";
import {DEFAULT_SCORER_TYPE} from "../constants/session-constants";
import {OmiliaSession} from "../utils/omilia-session";
import {SpeakerScore} from "../utils/speaker-score/speaker-score";

export class Formatter {

    public static getSessionStatusMessage(session: OmiliaSession): string {
        let timeWindowStr = "infinite";
        if (session.settings.timeWindowDuration) {
            timeWindowStr = session.settings.timeWindowDuration.toString();
        }

        let privilegedSpeakerBoard = "";
        if (session.getPrivilegedSpeakersInChannel().length) {
            privilegedSpeakerBoard =
                `**\`○ unmonitored speakers\`** ${PAUSE_COUNTS_EMOJI}\n  ` +
                Formatter.getPrivilegedSpeakersBoard(session, session.getPrivilegedSpeakersInChannel()) + "\n\n";
        }
        return "🪐 **Live Session** 🪐\n\n" +
            "**`○ next up`** 🎙️\n" +
            Formatter.getSpeakerBoard(session, session.getSortedCandidateSpeakerScores()) +
            "\n" +
            "**`○ speaker scores`** 🌀\n" +
            Formatter.getSpeakerBoard(session, session.getSortedVisibleSpeakerScores()) + "\n" +
            privilegedSpeakerBoard +
            `\`○ settings:\`\n` +
            `  ${Formatter.formatAttributeWithBadge("time window", timeWindowStr)}\n` +
            `  ${Formatter.formatAttributeWithBadge("refresh delay", session.settings.refreshDelay.toString())}\n` +
            `  ${Formatter.formatAttributeWithBadge("scoring mode", session.settings.speakerScorer.getScoreModeName())}\n` +
            "\n" +
            `\`○ actions:\`\n` +
            `  ${Formatter.formatAttributeWithBadge("request to speak", `${REQUEST_TO_SPEAK_EMOJI}`)}\n` +
            `  ${Formatter.formatAttributeWithBadge("hide from speaker board", `${HIDE_IN_SPEAKER_BOARD_EMOJI}`)}\n` +
            `  ${Formatter.formatAttributeWithBadge("stop being monitored", `${PAUSE_COUNTS_EMOJI}`)}\n`;
    }

    public static getHelpMessage(): string {
        return `\`\`\`Hej this is Omilia. I can help you make your conversations more inclusive.\`\`\`\n` +
            `**\`how it works\`**` +
            `\`\`\`\n` +
            `• I track how long everyone speaks in a voice channel. The ones that speak the least will be displayed first.\n` +
            `• I respect your privacy. I do not record any information or conversations. Check out my source code at ${REPO_URL} ☕.\n` +
            `\`\`\`\n` +
            `**\`how to use\`**\n` +
            `\`\`\`\n` +
            `• Start monitoring your conversations with "${COMMAND_PREFIX} ${START_MONITORING_CMD}" (with optional parameters).\n` +
            `• React with ${REQUEST_TO_SPEAK_EMOJI} on my status message when you are ready to speak.\n` +
            `• Stop monitoring a conversation with "${STOP_CMD}" or "${LEAVE_CMD}".\n` +
            `\`\`\`\n` +
            `**\`commands\`**\n` +
            `\`\`\`\n` +
            `• ${HELP_CMD}: well uhm...\n` +
            `• ${START_MONITORING_CMD}: start monitoring a conversation\n` +
            `  ○ arguments:\n` +
            `    ${TIME_WINDOW_DURATION}: how old an intervention can be to be taken into account\n` +
            `    ${STATUS_MESSAGE_REFRESH_DELAY}: time interval between every refresh\n` +
            `    ${SCORING_MODE}: scoring unit to use (default is ${SCORING_MODE_TO_ARG.get(DEFAULT_SCORER_TYPE)})\n` +
            `      ○ options:\n` +
            `        ${TOTAL_TIME_SCORE_ARG}: total time user has spoken\n` +
            `        ${VOICE_PRESENCE_SCORE_ARG}: fraction of time user has spoken while active in the voice channel\n` +
            `• ${LEAVE_CMD}: to make me leave the channel\n` +
            `• ${STOP_CMD}: same as ${LEAVE_CMD}\n` +
            `• ${DETAILS_CMD}: links to my source code and a list of my dependencies ☕.\n` +
            `\`\`\`\n` +
            `**\`example\`**\n` +
            `\`\`\`\n` +
            `${COMMAND_PREFIX} ${HELP_CMD}\n` +
            `${COMMAND_PREFIX} ${START_MONITORING_CMD} ${TIME_WINDOW_DURATION} 4m20s ${STATUS_MESSAGE_REFRESH_DELAY} 10s\n` +
            `${COMMAND_PREFIX} ${LEAVE_CMD}\n` +
            `${COMMAND_PREFIX} ${DETAILS_CMD}\n` +
            `\`\`\``;
    }

    public static getDetailsMessage(): string {
        let detailsMessage = `\`source code:\` ${REPO_URL}\n\n\`dependencies:\`\n`;
        for (const dependency of DEPENDENCIES) {
            detailsMessage += `  •\`${dependency.name}\` *(${dependency.license})* ${dependency.website}\n`;
        }
        detailsMessage += `\n*for details about what I can do... type "${COMMAND_PREFIX} ${HELP_CMD}"*`;
        return detailsMessage;
    }

    private static formatAttributeWithBadge(badge: string, value: string, bold: boolean = false): string {
        let boldifier = "";
        if (bold) {
            boldifier = "**";
        }
        return `${boldifier}\`• ${badge}\`${boldifier} ${value}`;
    }

    private static getSpeakerBoard(session: OmiliaSession, speakerScores: Array<[string, SpeakerScore]>): string {
        let speakerBoard = "";
        if (speakerScores.length === 0) {
            return `  none\n`;
        }

        speakerScores.forEach(([userId, speakerScore], idx) => {
            speakerBoard += `  ${this.formatAttributeWithBadge(`${idx + 1}`, `${session.getGuildMemberFromId(userId).displayName} ${speakerScore.toString()}`, true)}\n`;
        });
        return speakerBoard;
    }

    private static getPrivilegedSpeakersBoard(session: OmiliaSession, speakerIds: string[]): string {
        const speakerDisplayNames = speakerIds.map((speakerId) => session.getGuildMemberFromId(speakerId).displayName);
        return speakerDisplayNames.join(", ");
    }
}
