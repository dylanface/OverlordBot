const Discord = require('discord.js');

module.exports = {
	enabled: false,
    name: 'ping',
    description: "Perform test commands",
    async execute(interaction, client) {
		await interaction.deferReply();

		interaction.editReply({ content: 'Pong! 🏓'});

    }
}