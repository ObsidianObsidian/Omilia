import {Message} from "discord.js";
import {
    COMMAND_PREFIX, DETAILS_CMD,
    HELP_CMD,
    LEAVE_CMD,
    START_MONITORING_CMD, STATUS_MESSAGE_REFRESH_DELAY,
    STOP_CMD, TIME_WINDOW_DURATION,
} from "../constants/command-constants";
import {
    InvalidCommandFormatError,
    NoValueProvidedForArgumentError,
    UnknownArgumentError,
    UnknownCommandError,
} from "../constants/omilia-error";
import {DEFAULT_SESSION_REFRESH_DELAY, MINIMUM_REFRESH_DELAY} from "../constants/session-constants";
import {SessionSettings} from "../interfaces/session-settings";
import {OmiliaDuration} from "../utils/omilia-duration";
import {Formatter} from "./formatter";
import {Orchestrator} from "./orchestrator";

export class CommandManager {

    public static onBotCommand(message: Message): void {
        message.react("☑️");
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
                Orchestrator.startSession(message, CommandManager.extractSessionSettingsFromArgs(args));
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

    private static extractSessionSettingsFromArgs(args: string[]): SessionSettings {
        const sessionSettings: SessionSettings = {refreshDelay: new OmiliaDuration(DEFAULT_SESSION_REFRESH_DELAY)};
        for (let i = 0; i < args.length; i += 2) {
            const arg = args[i];
            const val = args[i + 1];
            if (!val) {
                throw new NoValueProvidedForArgumentError(arg);
            }
            switch (arg) {
                case TIME_WINDOW_DURATION:
                    sessionSettings.timeWindowDuration = OmiliaDuration.fromFormattedTimeString(val, true);
                    break;
                case STATUS_MESSAGE_REFRESH_DELAY:
                    sessionSettings.refreshDelay = OmiliaDuration.fromFormattedTimeString(val, true);
                    break;
                default:
                    throw new UnknownArgumentError(START_MONITORING_CMD, arg);
            }
        }

        const safeRefreshDelay = Math.max(MINIMUM_REFRESH_DELAY, sessionSettings.refreshDelay.valueOf());
        sessionSettings.refreshDelay = new OmiliaDuration(safeRefreshDelay);
        return sessionSettings;
    }
}
