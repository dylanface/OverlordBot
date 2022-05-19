const { CommandInteraction, Client } = require('discord.js');
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
    /**
     * @param { CommandInteraction } interaction The command interaction object.
     * @param { Client } client The discord client that called this command.
     */
    async execute(interaction, client) {
        const match = TicTacManager.createGame(interaction, client)


    }
}