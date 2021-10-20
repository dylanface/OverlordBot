const Discord = require('discord.js');
const PinMeManager = require('../../managers/PinMeManager');

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
		interaction.reply('Pong!');
        
		const pinMePost = new PinMeManager('1', interaction.member.id, interaction.member.id, interaction.fetchReply().id, interaction.channel.id, interaction.guildId, client);

		setTimeout(() => {
			pinMePost.pinMe()
		} , 10000);
    }
}