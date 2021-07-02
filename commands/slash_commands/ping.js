const Discord = require('discord.js');

module.exports = {
    name: 'ping',
    description: "Perform test commands",
    async execute(interaction, client) {
        
        const row = new Discord.MessageActionRow()
			.addComponents(
				new MessageSelectMenu()
					.setCustomID('select')
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
					]),
			);

		await interaction.reply({ content: 'Pong!', components: [row] });
        
        
    }
}