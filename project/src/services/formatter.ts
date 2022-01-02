import {
    COMMAND_PREFIX, DETAILS_CMD,
    HELP_CMD,
    LEAVE_CMD,
    START_MONITORING_CMD, STATUS_MESSAGE_REFRESH_DELAY,
    STOP_CMD,
    TIME_WINDOW_DURATION,
} from "../constants/command-constants";
import {DEPENDENCIES, REPO_URL} from "../constants/info-constants";
import {REQUEST_TO_SPEAK_EMOJI, REQUEST_TO_SPEAK_EMOJI_NAME} from "../constants/interaction-constants";
import {OmiliaSession} from "./omilia-session";

export class Formatter {

    public static getSessionStatusMessage(session: OmiliaSession): string {
        let timeWindowStr = "infinite";
        if (session.settings.timeWindowDuration) {
            timeWindowStr = Formatter.formatMsTime(session.settings.timeWindowDuration);
        }
        return "🪐 **Live Session** 🪐\n\n" +
            "**`○ next up`** 🎙️\n" +
            Formatter.getSpeakerBoard(session) +
            "\n\n" +
            `\`○ settings:\`\n` +
            // tslint:disable-next-line:max-line-length
            `  ${Formatter.formatAttributeWithBadge("time window", timeWindowStr)}\n` +
            `  ${Formatter.formatAttributeWithBadge("refresh delay", Formatter.formatMsTime(session.settings.refreshDelay))}\n` +
            "\n" +
            `To speak, react with ${REQUEST_TO_SPEAK_EMOJI}`;
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
            `• React with ${REQUEST_TO_SPEAK_EMOJI_NAME} on my status message when you are ready to speak.\n` +
            `• Stop monitoring a conversation with "${STOP_CMD}" or "${LEAVE_CMD}".\n` +
            `\`\`\`\n` +
            `**\`commands\`**\n` +
            `\`\`\`\n` +
            `• ${HELP_CMD}: well uhm...\n` +
            `• ${START_MONITORING_CMD}: start monitoring a conversation\n` +
            `  ○ arguments:\n` +
            `    ${TIME_WINDOW_DURATION}: how long ago an intervention can be taken into acount\n` +
            `    ${STATUS_MESSAGE_REFRESH_DELAY}: time interval between every refresh\n` +
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

    public static formatMsTime(speakerTime: number): string {
        const date = new Date(speakerTime).toISOString().substr(11, 8);
        const timeUnits = date.split(":");
        const unitStrs = ["h", "m", "s"];
        const displayStrings = [];
        timeUnits.forEach((unitStr, idx) => {
            const unit = Number(unitStr);
            if ((unit)) {
                displayStrings.push(`${unit}${unitStrs[idx]}`);
            }
        });
        return displayStrings.join(" ");
    }

    private static formatAttributeWithBadge(badge: string, value: string, bold: boolean = false): string {
        let boldifier = "";
        if (bold) {
            boldifier = "**";
        }
        return `${boldifier}\`• ${badge}\`${boldifier} ${value}`;
    }

    private static getSpeakerBoard(session: OmiliaSession): string {
        const speakerTimes = session.getSortedCandidateSpeakerTimes();
        let speakerBoard = "";
        if (speakerTimes.length === 0) {
            return `  only emptiness... react with ${REQUEST_TO_SPEAK_EMOJI} to speak!`;
        }

        speakerTimes.forEach(([userId, speakerTime], idx) => {
            speakerBoard += `  ${this.formatAttributeWithBadge(`${idx + 1}`, `${session.getGuildMemberFromId(userId).user.username} ${Formatter.formatMsTime(speakerTime)}`, true)}\n`;
        });
        return speakerBoard;
    }
}
