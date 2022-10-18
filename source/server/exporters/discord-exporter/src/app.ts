import {Client, GatewayIntentBits} from "discord.js";
import * as path from "path";
import * as fs from "fs";
import {Command} from "./commands/command";
import client, {Channel, Connection} from 'amqplib'
import {VoiceConnection} from "@discordjs/voice";

export let messagingMainChannel: Channel | undefined
export const messagingMainExchangeName = "EXCHANGE_NAME_EXPORTER"
export const guildIdToSessionId = new Map<string,string>();
export const sessionIdToGuildId = new Map<string,string>();
export const sessionIdToVoiceConnection = new Map<string, VoiceConnection>()

require("dotenv").config({path: "../../../../../.env"});

class OmiliaClient extends Client {
    get commands(): Map<string, Command> {
        return Command.getCommands();
    }
}

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    require(filePath);
}



export const omiliaClient = new OmiliaClient({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]});

omiliaClient.once('ready', () => {
    console.log('Bot is ready');
});

omiliaClient.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = omiliaClient.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({content: 'Error while executing command', ephemeral: true});
    }
});

async function setupMessaging(): Promise<void> {
    const connection: Connection = await client.connect(`amqp://guest:guest@messaging-service:5672`);
    console.log('connection successful')
    const channel: Channel = await connection.createChannel()
    messagingMainChannel = channel
    await channel.assertExchange(messagingMainExchangeName, 'topic', {durable: false})
    await channel.assertExchange("EXCHANGE_NAME_CONVERSATION_MANAGER", 'topic', {durable: false})
}


setupMessaging()

export function onSessionEnd(sessionId: string) {
    const voiceConnection = sessionIdToVoiceConnection.get(sessionId)
    if (voiceConnection !== null) {
        voiceConnection?.disconnect()
    }
    guildIdToSessionId.delete(sessionIdToGuildId.get(sessionId))
    sessionIdToGuildId.delete(sessionId)
    sessionIdToVoiceConnection.delete(sessionId)
    messagingMainChannel.publish(messagingMainExchangeName, `session_id.${sessionId}.end`, Buffer.from(""))
}

omiliaClient.login(process.env.DISCORDJS_BOT_TOKEN);