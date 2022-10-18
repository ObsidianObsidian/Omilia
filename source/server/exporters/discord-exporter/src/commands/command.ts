import {ChatInputCommandInteraction, CommandInteraction} from "discord.js";

export class Command {

    private static commands = new Map<string, Command>()

    constructor(private name: string, private description: string, public execute: (interaction: ChatInputCommandInteraction) => Promise<void>) {
        this.register()
    }

    private register(): void {
        Command.commands.set(this.name, this)
    }

    static getCommandsAsList(): Command[] {
        return Array.from(Command.commands.values())
    }

    static getCommands(): Map<string,Command> {
        return this.commands
    }

    getName(): string {
        return this.name
    }

    getDescription(): string {
        return this.description
    }
}
