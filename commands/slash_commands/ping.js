const Discord = require('discord.js');
const PinMeManager = require('../../managers/Admin/PinMeManager');
const { GuildChatGameManager } = require('../../managers/Games/ChatGameManager');
const { StatisticManager } = require('../../managers/Games/StatisticManager');

module.exports = {
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

		const fakeManager = await client.chatGameManager.getGuildChatGameManager(interaction.guildId);
		setTimeout(() => {
			fakeManager.beginChallenge()
			console.log(fakeManager)
			
		} , 3000);

		interaction.editReply({ content: 'Pong! 🏓'});

    }
}