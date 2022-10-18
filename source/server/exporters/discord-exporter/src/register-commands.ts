import path from "path";

import {Routes, SlashCommandBuilder} from 'discord.js';
import {REST} from '@discordjs/rest';
import {Command} from "./commands/command";
import * as fs from "fs";

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('.ts'));
for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
}
const commandsAsJson = Command.getCommandsAsList().map((cmd) => new SlashCommandBuilder().setName(cmd.getName()).setDescription(cmd.getDescription()).toJSON())

const rest = new REST({version: '10'}).setToken(process.env.DISCORDJS_BOT_TOKEN);

rest.put(Routes.applicationCommands(process.env.APPLICATION_CLIENT_ID), {body: commandsAsJson})
    .then((data) => console.log(`Successfully registered ${data} application commands.`))
    .catch(console.error);