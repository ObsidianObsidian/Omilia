import {Command} from "./command";
import {guildIdToSessionId, endSession} from "../app";

new Command('stop', 'Stops current session', async (interaction) => {
    if (!guildIdToSessionId.has(interaction.guild.id)) {
        interaction.reply('There are no active sessions')
        return
    }
    const sessionId = guildIdToSessionId.get(interaction.guild.id);
    endSession(sessionId)
    interaction.reply('Session ended')
})