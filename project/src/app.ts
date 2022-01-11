import {Orchestrator} from "./services/orchestrator";
// tslint:disable-next-line:no-var-requires
require("dotenv").config({path: "../../.env"});
import {Client, Intents, Message} from "discord.js";
import {COMMAND_PREFIX, HELP_CMD} from "./constants/command-constants";
import {MENTION_REACTION_EMOJI} from "./constants/interaction-constants";
import {notifyOmiliaError, OmiliaErrors} from "./constants/omilia-errors";
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
    console.log("client connected");
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
    easterify(message);
    if (messageShouldBeIgnored((message))) {
        return;
    }
    try {
        CommandManager.onBotCommand(message);
    } catch (e) {
        if (e instanceof OmiliaErrors) {
            notifyOmiliaError(e, message.channel);
        }
    }
}

function messageShouldBeIgnored(message: Message): boolean {
    return !CommandManager.isBotCommand(message.content) || message.author.bot;
}

function easterify(message: Message): void {
    if (message.mentions.users.has(client.user.id)) {
        message.react(MENTION_REACTION_EMOJI);
    }
}

function setup(): void {
    client.user.setActivity(`${COMMAND_PREFIX} ${HELP_CMD}`);
}
