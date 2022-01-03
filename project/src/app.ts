import {Orchestrator} from "./services/orchestrator";
// tslint:disable-next-line:no-var-requires
require("dotenv").config({path: "../../.env"});
import {Client, Intents, Message} from "discord.js";
import {COMMAND_PREFIX, HELP_CMD} from "./constants/command-constants";
import {notifyOmiliaError, OmiliaError} from "./constants/omilia-error";
import {CommandManager} from "./services/command-manager";

export const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
    ],
});
client.login(process.env.DISCORDJS_BOT_TOKEN);

client.on("ready", () => {
    console.log("Logged");
    setup();
});

client.on("messageCreate", (message: Message) => {
    onMessageCreate(message);
});

client.on("messageReactionAdd", (reaction) => {
    Orchestrator.onMessageReactionChange(reaction);
});

client.on("messageReactionRemove", (reaction) => {
    Orchestrator.onMessageReactionChange(reaction);
});

function onMessageCreate(message: Message): void {
    if (messageShouldBeIgnored((message))) {
        return;
    }
    try {
        CommandManager.onBotCommand(message);
    } catch (e) {
        if (e instanceof OmiliaError) {
            notifyOmiliaError(e, message.channel);
        }
    }
}

function messageShouldBeIgnored(message: Message): boolean {
    return !CommandManager.isBotCommand(message.content) || message.author.bot;
}

function setup(): void {
    client.user.setActivity(`${COMMAND_PREFIX} ${HELP_CMD}`);
}
