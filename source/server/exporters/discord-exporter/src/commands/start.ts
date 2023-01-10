import {Command} from "./command";
import {
    guildIdToSessionId,
    messagingMainChannel,
    messagingExporterExchangeName,
    sessionIdToGuildId,
    sessionIdToVoiceConnection
} from "../app";
import {v4 as uuidv4} from 'uuid';
import {
    SessionCreationRequest, UserSessionEvent,
    SessionCreationRequestResponse, UserConnectionStatusEvent, UserProfileInfo,
} from "../common-types/common-types";
import {GuildMember, VoiceBasedChannel, VoiceState} from 'discord.js';
import {joinVoiceChannel, VoiceConnection} from "@discordjs/voice";

new Command('start', 'Start a new session', async (interaction) => {
    if (guildIdToSessionId.has(interaction.guild.id)) {
        interaction.reply(`Session with Id ${guildIdToSessionId} is already active`)
    }
    const member = await interaction.guild.members.fetch({user: interaction.member.user.id})
    const voiceChannel = member.voice.channel
    if (voiceChannel) {
        const voiceChannelMembers: UserProfileInfo[] = []
        Array.from(voiceChannel.members.values()).filter(user => !user.user.bot).map(user => {
            voiceChannelMembers.push({id: user.id, displayName: user.displayName, avatarURL: user.displayAvatarURL()})
        })
        const sessionId = await requestNewSession(voiceChannelMembers)
        guildIdToSessionId.set(interaction.guild.id, sessionId)
        sessionIdToGuildId.set(sessionId, interaction.guild.id)
        const voiceConnection = await connectToVoiceChannel(sessionId, voiceChannel)
        sessionIdToVoiceConnection.set(sessionId, voiceConnection)
        void setupListeners(sessionId, voiceConnection)
        interaction.reply(`Session started: ${process.env.OMILIA_BASE_URL}/session/${sessionId}`)
    } else {
        interaction.reply('Must be in a voice channel!')
    }
})

async function requestNewSession(users: UserProfileInfo[]): Promise<string> {
    return new Promise<string>((resolve) => {
        const requestId = uuidv4()
        const createSessionRequest: SessionCreationRequest = {requestId, users}
        messagingMainChannel.assertQueue('', {exclusive: true}).then(async (reply) => {
            await messagingMainChannel.bindQueue(reply.queue, "EXCHANGE_NAME_CONVERSATION_MANAGER", `#.create_session.${requestId}.#`)
            await messagingMainChannel.consume(reply.queue, (msg) => {
                const sessionCreationResponse: SessionCreationRequestResponse = JSON.parse(msg.content.toString())
                resolve(sessionCreationResponse.sessionId)
            }, {noAck: true})
            messagingMainChannel.publish(messagingExporterExchangeName, 'create_session', Buffer.from(JSON.stringify(createSessionRequest)))
        });
    });
}

async function connectToVoiceChannel(sessionId: string, voiceChannel: VoiceBasedChannel): Promise<VoiceConnection> {
    return joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
    });
}

async function setupListeners(sessionId: string, voiceConnection: VoiceConnection): Promise<void> {
    voiceConnection.receiver.speaking.on("start", ((userId) => {
        const userSessionEvent:UserSessionEvent = {sessionId, userId}
        messagingMainChannel.publish(messagingExporterExchangeName, `session_id.${sessionId}.speaker_id.${userId}.speaking.start`, Buffer.from(JSON.stringify(userSessionEvent)))
    }));
    voiceConnection.receiver.speaking.on("end", ((userId) => {
        const userSessionEvent:UserSessionEvent = {sessionId, userId}
        messagingMainChannel.publish(messagingExporterExchangeName, `session_id.${sessionId}.speaker_id.${userId}.speaking.stop`, Buffer.from(JSON.stringify(userSessionEvent)))
    }));
}
