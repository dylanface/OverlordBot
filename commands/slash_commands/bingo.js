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
        interaction.defer()

        const name = await interaction.options.get('name').value

        const match = BingoManager.createGame(name, interaction.user, interaction)
        }
}