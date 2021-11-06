const Discord = require('discord.js');
const PinMeManager = require('../../managers/Admin/PinMeManager');
const { GuildChatGameManager } = require('../../managers/Games/ChatGameManager');

module.exports = {
    name: 'ping',
    description: "Perform test commands",
    async execute(interaction, client) {
		await interaction.deferReply();
		const fakeManager = await client.chatGameManager.getGuildChatGameManager(interaction.guildId);
		setTimeout(() => {
			fakeManager.beginChallenge()
			
		} , 5000);

		interaction.editReply({ content: 'Pong! 🏓'});

    }
}