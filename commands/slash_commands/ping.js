const Discord = require('discord.js');

module.exports = {
	enabled: false,
    name: 'ping',
    description: "Perform test commands",
	defaultPermission: false,
	permissions: [{
			id: '265023187614433282',
			type: 'USER',
			permission: true,
	}],
    async execute(interaction, client) {
		await interaction.deferReply();

		interaction.editReply({ content: 'Pong! 🏓'});

    }
}