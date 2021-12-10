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

		// const fakeManager = new StatisticManager(null, 'json_local', client);
		// setTimeout(async () => {
		// 	await fakeManager.updateStatsCache('673339828590608403', { total: 10, correct: 5, incorrect: 5 });

		// 	await fakeManager.saveStatsLocal();
		// } , 10000);
		// setTimeout(() => {

		// 	fakeManager.fetchStats()
		// }, 10000)


		const fakeManager = await client.chatGameManager.getGuildChatGameManager(interaction.guildId);
		setTimeout(() => {
			fakeManager.beginChallenge()
			console.log(fakeManager)
			
		} , 3000);

		interaction.editReply({ content: 'Pong! 🏓'});

    }
}