const { CommandInteraction, Client } = require('discord.js');
const BingoManager = require('../../managers/game_managers/games/BingoManager');

module.exports = {
    enabled: false,
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
    /**
     * @param { CommandInteraction } interaction The command interaction object.
     * @param { Client } client The discord client that called this command.
     */
    async execute(interaction, client) {
        //doesn't need client ^
        await interaction.deferReply()

        const name = interaction.options.get('name').value
        //const gameName = await interaction.options.get('name').value

        BingoManager.createGame(name, interaction.user, interaction, client)
        //BingoManager.createGame(gameName, interaction.user, interaction)
    }
}