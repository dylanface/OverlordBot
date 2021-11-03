const Discord = require('discord.js');
const TicTacManager = require('../../managers/Games/TicTacManager.js');

module.exports = {
    name: 'tictactoe',
    description: "Challenge another user to tic tac toe",
    options: [{
        name: 'challenger',
        type: 'USER',
        description: 'The user you would like to challenge',
        required: true,
    }],
    defaultPermission: true,
    async execute(interaction, client) {
        await interaction.defer()
        const match = TicTacManager.createGame(interaction, client)


    }
}