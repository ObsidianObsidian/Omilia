import {GuildTextBasedChannel, If, TextBasedChannel} from "discord.js";
import {OmiliaDuration} from "../utils/omilia-duration";
import {AVAILABLE_COMMAND_ARGS, AVAILABLE_COMMANDS, COMMAND_PREFIX, LEAVE_CMD, STOP_CMD} from "./command-constants";
import {MAXIMUM_INACTIVITY_THRESHOLD} from "./session-constants";

export class OmiliaErrors extends Error {
}

// tslint:disable:max-classes-per-file
export class InvalidCommandFormatError extends OmiliaErrors {
    constructor(messageContent: string) {
        super(`"${messageContent}" is not a valid command.\n`
            + `Please use the following format:\n`
            + `\`${COMMAND_PREFIX}\` \`command name\` \`(optional) arguments\``);
    }
}

export class UnknownCommandError extends OmiliaErrors {
    constructor(commandName: string) {
        super(`"${commandName}" is not a known command.\n`
            + `Please use one the following commands:\n`
            + `\`${Array.from(AVAILABLE_COMMANDS.keys()).join("\` | \`")}\``);
    }
}

export class UnknownArgumentError extends OmiliaErrors {
    constructor(commandName: string, argumentName: string) {
        super(`"${argumentName}" is not a known argument of the "${commandName}" command.\n`
            + `Please use one the following commands:\n`
            + `\`${AVAILABLE_COMMAND_ARGS.get(commandName).join("\` | \`")}\``);
    }
}

export class NoValueProvidedForArgumentError extends OmiliaErrors {
    constructor(argumentName: string) {
        super(`"${argumentName}" was not provided with a value.\n`
            + `Please provide a value right after the argument like so:\n`
            + `\`${argumentName}\` \`YOUR_DESIRED_VALUE\``);
    }
}

export class InvalidTimeFormatError extends OmiliaErrors {
    constructor(formattedTime: string) {
        super(`"${formattedTime}" is not a valid duration/time.\n`
            + `Please use a format along these lines:\n`
            + `\`1h40m15s\` | \`1h40s\` | \`90m80s\` | \`120s\``);
    }
}

export class NotInVoiceChannelError extends OmiliaErrors {
    constructor() {
        super(`Cannot start monitoring. You need to be in a voice channel 👁️‍🗨️.`);
    }
}

export class InactivityTimeoutError extends OmiliaErrors {
    constructor() {
        super(`Left the channel. No one spoke for more than ` +
            `${new OmiliaDuration(MAXIMUM_INACTIVITY_THRESHOLD).toString()}.\n`);
    }
}

export class AlreadyDisconnectedError extends OmiliaErrors {
    constructor() {
        super(`Cannot ${STOP_CMD} or ${LEAVE_CMD}. I am already gone 🍃.`);
    }
}

export class SessionAlreadyActiveError extends OmiliaErrors {
    constructor() {
        super(`Cannot start a new session. I am already listening 🎙️.`);
    }
}

export function notifyOmiliaError(error: OmiliaErrors, channel: If<boolean, GuildTextBasedChannel, TextBasedChannel>) {
    if (error instanceof OmiliaErrors) {
        // @ts-ignore
        channel.send("`❌` " + error.message);
    }
}
