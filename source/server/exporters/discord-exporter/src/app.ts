import {Client, GatewayIntentBits, GuildMember, VoiceState} from "discord.js";
import * as path from "path";
import * as fs from "fs";
import {Command} from "./commands/command";
import client, {Channel, Connection} from 'amqplib'
import {VoiceConnection} from "@discordjs/voice";
import {Convert, UserConnectionStatusEvent, UserProfileInfo} from "./common-types/common-types";

export let messagingMainChannel: Channel | undefined
export const messagingExporterExchangeName = "EXCHANGE_NAME_EXPORTER"
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

async function setupMessaging(): Promise<void> {
    const connection: Connection = await client.connect(`amqp://guest:guest@messaging-service`);
    console.log('connection successful')
    const channel: Channel = await connection.createChannel()
    messagingMainChannel = channel
    await channel.assertExchange(messagingExporterExchangeName, 'topic', {durable: false})
    await channel.assertExchange("EXCHANGE_NAME_CONVERSATION_MANAGER", 'topic', {durable: false})
}


setupMessaging()

export function endSession(sessionId: string): void {
    const voiceConnection = sessionIdToVoiceConnection.get(sessionId)
    if (voiceConnection !== null) {
        voiceConnection?.disconnect()
    }
    if (!sessionIdToGuildId.has(sessionId)) {
        return
    }
    guildIdToSessionId.delete(sessionIdToGuildId.get(sessionId))
    sessionIdToGuildId.delete(sessionId)
    sessionIdToVoiceConnection.delete(sessionId)
    messagingMainChannel.publish(messagingExporterExchangeName, `session_id.${sessionId}.end`, Buffer.from(Convert.sessionEventToJson({sessionId: sessionId})))
}

function setupListeners(): void {
    omiliaClient.on('voiceStateUpdate', (oldState, newState) => {
        const sessionId = guildIdToSessionId.get(newState.guild.id)
        if(sessionId !== null) {
            onVoiceStateUpdate(oldState, newState, sessionId)
        }
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
}

function onVoiceStateUpdate(oldState: VoiceState, newState: VoiceState, sessionId: string) {
    const selfVoiceStateUpdate = oldState.member.user.id === omiliaClient.user.id
    const isFromIrrelevantUser = oldState.member.user.bot && !selfVoiceStateUpdate
    if (isFromIrrelevantUser) {
        return
    }

    const isConnection = oldState.channel == null && newState.channel != null
    const isDisconnection = oldState.channel != null && newState.channel == null
    const connectionStatusChange = isConnection || isDisconnection
    if (!connectionStatusChange) {
        return
    }
    if (selfVoiceStateUpdate) {
        onSelfVoiceStateUpdate(isConnection, sessionId)
    } else {
        onUserVoiceStateUpdate(newState.member, isConnection, sessionId)
    }
}

function onSelfVoiceStateUpdate(isConnection: boolean, sessionId: string) {
    if (!isConnection) {
        endSession(sessionId)
    }
}

function onUserVoiceStateUpdate(guildMember: GuildMember, isConnection: boolean, sessionId: string) {
    const baseRoutingKey = `session_id.${sessionId}.speaker_id.${guildMember.id}.connection_status`
    const connectionStatusIndicator = isConnection ? 'join' : 'leave'
    const event: UserConnectionStatusEvent = {userId: guildMember.id, eventName: connectionStatusIndicator, sessionId}
    messagingMainChannel.publish(messagingExporterExchangeName, `${baseRoutingKey}.${connectionStatusIndicator}`, Buffer.from(Convert.userSessionEventToJson(event)))
    if (isConnection) {
        const userProfileInfo: UserProfileInfo = {
            avatarURL: guildMember.displayAvatarURL(), displayName: guildMember.displayName, id: guildMember.id
        }
        messagingMainChannel.publish(messagingExporterExchangeName, 'user_join', Buffer.from(Convert.userProfileInfoToJson(userProfileInfo)))
    }
}


setupListeners()
omiliaClient.login(process.env.DISCORDJS_BOT_TOKEN)