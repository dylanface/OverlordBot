const Discord = require('discord.js');
const TicTacManager = require('../../managers/game_managers/games/TicTacManager');

module.exports = {
    enabled: false,
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
        const match = TicTacManager.createGame(interaction, client)


    }
}