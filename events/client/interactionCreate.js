const { Client, BaseInteraction } = require('discord.js');

module.exports = {
	name: 'interactionCreate',
    /**
     * 
     * @param {BaseInteraction} interaction The interaction that was triggered
     * @param {Client} client The client that the interaction belongs to
     */
	async execute(interaction, client) {
        if (interaction.isCommand()) {
            const sCommandName = interaction.commandName;
            const sCommand = client.slashCommands.get(sCommandName);
            if (!sCommand) return;

            try {
                sCommand.execute(interaction, client);
            } catch (error) {
                console.log(error);
                interaction.reply('There was an error executing the command, please try again later or contact support.');
            }

        } else if (interaction.isContextMenuCommand()) {

            const cCommandName = interaction.commandName;
            const cCommand = client.contextMenuCommands.get(cCommandName);
            if (!cCommand) return;


            try {
                cCommand.execute(interaction, client);
            } catch (error) {
                console.log(error);
            }

        } else if (interaction.isAutocomplete()) {
            const autocompleteName = interaction.commandName;
            const autocomplete = client.autocompleteInteractions.get(autocompleteName);
            if (!autocomplete) return;


            try {
                autocomplete.execute(interaction, client);
            } catch (error) {
                console.log(error);
            }

        } else return;

    }
}