const { CommandInteraction, Client } = require('discord.js');

module.exports = {
	enabled: false,
    name: 'ping',
    description: "Perform test commands",
    /**
     * @param { CommandInteraction } interaction The command interaction object.
     * @param { Client } client The discord client that called this command.
     */
    async execute(interaction, client) {
		await interaction.deferReply();

		interaction.editReply({ content: 'Pong! 🏓'});

    }
}