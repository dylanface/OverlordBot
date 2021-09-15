const Discord = require('discord.js');
const { generateTicTacCanvas } = require('../../handlers/canvas_handler');

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
        
        const row = new Discord.MessageSelectMenu()
			.setCustomId('select')
			.setPlaceholder('Nothing selected')
			.addOptions([
				{
					label: 'Select me',
					description: 'This is a description',
					value: 'first_option',
				},
				{
					label: 'You can select me too',
					description: 'This is also a description',
					value: 'second_option',
				},
			])

		const message = await interaction.reply({ content: 'Pong!', components: [[row]] });

        
        const filter = i => i.customId === 'select';

		const collector = interaction.channel.createMessageComponentCollector(filter);

		collector.on('collect', interaction => {});
		collector.on('end', collected => console.log(`Collected ${collected.size} items`));
    }
}