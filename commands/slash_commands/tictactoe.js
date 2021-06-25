const Discord = require('discord.js');

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

        interaction.defer();

        const challengerID = interaction.options.get('challenger').value;
        const challenger = await client.users.fetch(challengerID, true);

        const board = [];

        const emptyButton = [
            new Discord.MessageButton()
            .setCustomID('empty')
            .setLabel(`-`)
            .setStyle('SECONDARY')
        ]

        const playerButton = [
            new Discord.MessageButton()
            .setCustomID('player')
            .setLabel(`❌`)
            .setStyle('DANGER')
            .setDisabled(true)
        ]

        const challengerButton = [
            new Discord.MessageButton()
            .setCustomID('challenger')
            .setLabel(`🔵`)
            .setStyle('PRIMARY')
            .setDisabled(true)
        ]

        const emptyBoard = [
            emptyButton,
            emptyButton,
            emptyButton,
        ]

        const row1 = new Discord.MessageActionRow()
            .addComponents(
                emptyBoard
        );

        const row2 = new Discord.MessageActionRow()
            .addComponents(
                emptyBoard
        );

        const row3 = new Discord.MessageActionRow()
            .addComponents(
                emptyBoard
        );

        interaction.editReply(``, {components: [row1, row2, row3]})



    }
}