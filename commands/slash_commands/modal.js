const { MessageActionRow, Modal, TextInputComponent, Client, CommandInteraction } = require('discord.js');

module.exports = {
    name: 'modal',
    description: 'Open a test modal',
	/**
	 * @param { CommandInteraction } interaction The command interaction object.
	 * @param { Client } client The discord client that called this command.
	 */
    async execute(interaction, client) {
		const modal = new Modal()
			.setCustomId('massBanModal')
			.setTitle('Mass Ban Input');

		const idList = new TextInputComponent()
			.setCustomId('idList')
			.setLabel("Copy and paste user list below.")
			.setStyle('PARAGRAPH');

		const reasoning = new TextInputComponent()
			.setCustomId('reasoning')
			.setLabel("What is your reasoning for this ban?")
			.setStyle('PARAGRAPH');

		const firstActionRow = new MessageActionRow().addComponents(idList);
		const secondActionRow = new MessageActionRow().addComponents(reasoning);
	
		modal.addComponents(firstActionRow, secondActionRow);

		await interaction.showModal(modal);

		const filter = (i) => i.customId === 'massBanModal';
		interaction.awaitModalSubmit({ filter, time: 15000 })
		.then(async (i) => {
			const idList = i.fields.getTextInputValue('idList');
			const reasoning = i.fields.getTextInputValue('reasoning');

			await i.reply('You have submitted the following values: \n' + idList + '\n' + reasoning);
		})
		.catch(console.error);

    }
}