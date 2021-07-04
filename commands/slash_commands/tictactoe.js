const Discord = require('discord.js');
const TicTacManager = require('../../managers/TicTacManager.js');

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

        const { value: challengerID } = interaction.options.get('challenger')
        const challenger = await client.users.fetch(challengerID, true)

        const generated = new Discord.MessageEmbed()
            .setTitle(`❌ ⊲ TicTacToe Game ⊳ ⭕`)
            .setDescription(
                `\`\`\`${interaction.user.tag} ⚔️ ${challenger.tag}
                ⇣
    Your match has been created!\`\`\``)

        await interaction.editReply({ embeds: [generated] })

    }
}