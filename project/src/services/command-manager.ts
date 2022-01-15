import {Message} from "discord.js";
import {
    COMMAND_PREFIX, DETAILS_CMD, EDIT_SETTINGS_CMD,
    HELP_CMD,
    LEAVE_CMD, SCORING_MODE_ARG,
    START_MONITORING_CMD, STATUS_MESSAGE_REFRESH_DELAY_ARG,
    STOP_CMD, TIME_WINDOW_DURATION_ARG,
} from "../constants/command-constants";
import {MESSAGE_HAS_BEEN_NOTICED_EMOJI} from "../constants/interaction-constants";
import {
    InvalidCommandFormatError,
    NoValueProvidedForArgumentError,
    UnknownArgumentError,
    UnknownCommandError,
} from "../constants/omilia-errors";
import {
    MINIMUM_REFRESH_DELAY,
} from "../constants/session-constants";
import {SessionSettingsDifferences} from "../interfaces/session-settings-differences";
import {OmiliaDuration} from "../utils/omilia-duration";
import {SpeakerScorer} from "../utils/speaker-scorer/speaker-scorer";
import {Formatter} from "./formatter";
import {Orchestrator} from "./orchestrator";

export class CommandManager {

    public static onBotCommand(message: Message): void {
        message.react(MESSAGE_HAS_BEEN_NOTICED_EMOJI);
        if (!CommandManager.isValidCommandFormat(message.content)) {
            throw new InvalidCommandFormatError(message.content);
        }

        const [command, args] = CommandManager.parseCommand(message.content);
        switch (command) {
            case HELP_CMD:
                // @ts-ignore
                message.channel.send(Formatter.getHelpMessage());
                break;
            case START_MONITORING_CMD:
                Orchestrator.startSession(message, CommandManager.extractSessionSettingsFromArgs(args, command));
                break;
            case EDIT_SETTINGS_CMD:
                Orchestrator.editSessionSettings
                (message.guildId, CommandManager.extractSessionSettingsFromArgs(args, command));
                break;
            case LEAVE_CMD:
            case STOP_CMD:
                Orchestrator.stopSession(message.guildId);
                break;
            case DETAILS_CMD:
                // @ts-ignore
                message.channel.send(Formatter.getDetailsMessage());
                break;
            default:
                throw new UnknownCommandError(command);
        }
    }

    public static isBotCommand(messageText: string): boolean {
        return messageText.startsWith(COMMAND_PREFIX);
    }

    private static isValidCommandFormat(messageContent: string): boolean {
        const isBotCommand = CommandManager.isBotCommand(messageContent);
        const containsCommand = messageContent.split(" ").length >= 2;
        return isBotCommand && containsCommand;
    }

    private static parseCommand(messageContent: string): [string, string[]] {
        const allArgs = messageContent.split(" ");
        const command = allArgs[1];
        let args = [];
        const cmdHasArgs = allArgs.length > 2;
        if (cmdHasArgs) {
            args = allArgs.slice(2);
        }
        return [command, args];
    }

    private static extractSessionSettingsFromArgs(args: string[], command: string): SessionSettingsDifferences {
        const sessionSettings: SessionSettingsDifferences = {};
        for (let i = 0; i < args.length; i += 2) {
            const arg = args[i];
            const val = args[i + 1];
            if (!val) {
                throw new NoValueProvidedForArgumentError(arg);
            }
            switch (arg) {
                case TIME_WINDOW_DURATION_ARG:
                    sessionSettings.timeWindowDuration = OmiliaDuration.fromFormattedTimeString(val, true);
                    break;
                case STATUS_MESSAGE_REFRESH_DELAY_ARG:
                    sessionSettings.refreshDelay = OmiliaDuration.fromFormattedTimeString(val, true);
                    break;
                case SCORING_MODE_ARG:
                    sessionSettings.speakerScorer = SpeakerScorer.fromArgString(val);
                    break;
                default:
                    throw new UnknownArgumentError(command, arg);
            }
        }

        if (sessionSettings.refreshDelay) {
            const safeRefreshDelay = Math.max(MINIMUM_REFRESH_DELAY, sessionSettings.refreshDelay.valueOf());
            sessionSettings.refreshDelay = new OmiliaDuration(safeRefreshDelay);
        }
        return sessionSettings;
    }
}
