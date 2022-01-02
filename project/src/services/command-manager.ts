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
    InvalidTimeFormatError, NoValueProvidedForArgumentError,
    UnknownArgumentError,
    UnknownCommandError,
} from "../constants/omilia-error";
import {DEFAULT_SESSION_SETTINGS, MINIMUM_REFRESH_DELAY} from "../constants/session-constants";
import {SessionSettings} from "../interfaces/session-settings";
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

    private static getMsTimeFromFormatted(formattedTime: string): number {
        const unitStrs: Array<[string, number]> = [["h", 60 * 60 * 1000], ["m", 60 * 1000], ["s", 1000]];
        let totalTime = 0;
        try {
            for (const [unitStr, toMsConstant] of unitStrs) {
                const unitIdx = formattedTime.indexOf(unitStr);
                if (unitIdx === -1) {
                    continue;
                }
                let numStart = unitIdx;
                while (!isNaN(Number(formattedTime[numStart - 1]))) {
                    numStart--;
                }
                totalTime += Number(formattedTime.substring(numStart, unitIdx)) * toMsConstant;
                if (!(numStart < unitIdx)) {
                    throw new Error();
                }
            }
        } catch (e) {
            throw new InvalidTimeFormatError(formattedTime);
        }
        return totalTime;
    }

    private static extractSessionSettingsFromArgs(args: string[]): SessionSettings {
        const sessionSettings: SessionSettings = DEFAULT_SESSION_SETTINGS;
        for (let i = 0; i < args.length; i += 2) {
            const arg = args[i];
            const val = args[i + 1];
            if (!val) {
                throw new NoValueProvidedForArgumentError(arg);
            }
            switch (arg) {
                case TIME_WINDOW_DURATION:
                    sessionSettings.timeWindowDuration = CommandManager.getMsTimeFromFormatted(val);
                    if (sessionSettings.timeWindowDuration === 0) {
                        throw new InvalidTimeFormatError(val);
                    }
                    break;
                case STATUS_MESSAGE_REFRESH_DELAY:
                    sessionSettings.refreshDelay = CommandManager.getMsTimeFromFormatted(val);
                    if (sessionSettings.refreshDelay === 0) {
                        throw new InvalidTimeFormatError(val);
                    }
                    break;
                default:
                    throw new UnknownArgumentError(START_MONITORING_CMD, arg);
            }
        }

        sessionSettings.refreshDelay = Math.max(MINIMUM_REFRESH_DELAY, sessionSettings.refreshDelay);
        return sessionSettings;
    }
}
