const BingoManager = require('../../managers/BingoManager.js');

module.exports = {
    name: 'bingo',
    description: "The main bingo command",
    options: [
        {
            name: 'name',
			type: 'STRING',
			description: 'Input name of game',
            required: true,
        }
    ],
    async execute(interaction, client) {
        await interaction.defer()

        const name = await interaction.options.get('name').value

        BingoManager.createGame(name, interaction.user, interaction)
    }
}