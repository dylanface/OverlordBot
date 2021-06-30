const BingoManager = require('../../managers/BingoManager.js');
const Discord = require('discord.js')

module.exports = {
    name: 'bingotest',
    description: "Make a board",
    async execute(interaction, client) {
        interaction.defer()
        
        const boards = BingoManager.createBoards()

        console.log(boards)
        
        const row1Buttons = new Discord.MessageActionRow()
        const row2Buttons = new Discord.MessageActionRow()
        const row3Buttons = new Discord.MessageActionRow()
        const row4Buttons = new Discord.MessageActionRow()
        const row5Buttons = new Discord.MessageActionRow()
        
        
        const row1 = await boards.slice(0, 5).forEach(number => {
            row1Buttons.addComponents(
                new Discord.MessageButton()
                    .setCustomID(`${number}_button`)
                    .setLabel(`${number} `)
                    .setStyle('PRIMARY'),
            );
        })
        
        const row2 = await boards.slice(5, 10).forEach(number => {
            row2Buttons.addComponents(
                new Discord.MessageButton()
                    .setCustomID(`${number}_button`)
                    .setLabel(`${number} `)
                    .setStyle('PRIMARY'),
            );
        })
        const row3 = await boards.slice(10, 15).forEach(number => {
            row3Buttons.addComponents(
                new Discord.MessageButton()
                    .setCustomID(`${number}_button`)
                    .setLabel(`${number} `)
                    .setStyle('PRIMARY'),
            );
        })
        const row4 = await boards.slice(15, 20).forEach(number => {
            row4Buttons.addComponents(
                new Discord.MessageButton()
                    .setCustomID(`${number}_button`)
                    .setLabel(`${number} `)
                    .setStyle('PRIMARY'),
            );
        })
        const row5 = await boards.slice(20, 25).forEach(number => {
            row5Buttons.addComponents(
                new Discord.MessageButton()
                    .setCustomID(`${number}_button`)
                    .setLabel(`${number} `)
                    .setStyle('PRIMARY'),
            );
        })
            
        interaction.editReply(` 🇧        🇮       🇳       🇬       🇴  ` ,{ components: [row1Buttons, row2Buttons, row3Buttons, row4Buttons, row5Buttons]})
        
        const message = await interaction.fetchReply();
		const filter = i => i.customID !== 'dog' && i.user.id === interaction.user.id;
        
		const collector = message.createMessageComponentInteractionCollector( filter );

		collector.on('collect', async i => {
            i.message.components.forEach(row => {
                row.components.forEach(button => {
                    if (button.customID === i.customID) {
                        button.setStyle('DANGER')
                        button.setDisabled(true)
                        // console.log(button)
                    }
                })
            })
            console.log(i.message.components[0])
            await i.update({ content: ` 🇧        🇮       🇳       🇬       🇴  `, components: [i.message.components[0], i.message.components[1], i.message.components[2], i.message.components[3], i.message.components[4]]});
		});
		collector.on('end', collected => console.log(`Collected ${collected}`));
	}
}
/**
   * Fetches the initial reply to this interaction.
   * @see Webhook#fetchMessage
   * @returns {Promise<Message|Object>}
   * @example
   * // Fetch the reply to this interaction
   * interaction.fetchReply()
   *   .then(reply => console.log(`Replied with ${reply.content}`))
   *   .catch(console.error);
   
    async fetchReply() {
    const raw = await this.webhook.fetchMessage('@original');
    return this.channel?.messages.add(raw) ?? raw;
}*/