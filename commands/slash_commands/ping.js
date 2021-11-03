const Discord = require('discord.js');
const PinMeManager = require('../../managers/Admin/PinMeManager');
const { GuildChatGameManager } = require('../../managers/Games/ChatGameManager');

module.exports = {
    name: 'ping',
    description: "Perform test commands",
	options: [
		{
				name: 'pinger',
				type: 'STRING',
				description: 'Specific ping parameters provided as a string',
		}
	],
    async execute(interaction, client) {
		const fakeManager = new GuildChatGameManager(interaction.guildId, client);
		setTimeout(() => {
			fakeManager.beginChallenge()
			
		} , 5000);
    }
}