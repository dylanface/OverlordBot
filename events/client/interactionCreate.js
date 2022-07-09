const { Client, Interaction} = require('discord.js');

module.exports = {
	name: 'interactionCreate',
    /**
     * 
     * @param {Interaction} interaction The interaction that was triggered
     * @param {Client} client The client that the interaction belongs to
     */
	async execute(interaction, client) {
        if (interaction.isCommand()) {
            const sCommandName = interaction.commandName;
            const sCommand = client.slashCommands.get(sCommandName);

            try {
            sCommand.execute(interaction, client);
            } catch (error) {
            console.log(error);
            interaction.reply('There was an error executing the command, please try again later or contact support.');
            }

        } else if (interaction.isContextMenu()) {

            const cCommandName = interaction.commandName;
            const cCommand = client.contextMenuCommands.get(cCommandName);

            try {
            cCommand.execute(interaction, client);
            } catch (error) {
            console.log(error);
            }

        } else return;

    }
}