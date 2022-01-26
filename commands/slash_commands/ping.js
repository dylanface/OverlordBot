const Discord = require('discord.js');
const PinMeManager = require('../../managers/admin/PinMeManager');
const { GuildChatGameManager } = require('../../managers/game_managers/ChatGameManager');
const { StatisticManager } = require('../../managers/game_managers/StatisticManager');

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

		const testManager = await client.chatGameManager.getGuildChatGameManager(interaction.guild.id);
		await testManager.createMatch('word_scramble', interaction.channel);


		interaction.editReply({ content: 'Pong! 🏓'});

    }
}