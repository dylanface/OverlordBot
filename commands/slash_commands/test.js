const { CommandInteraction, Client } = require('discord.js');

module.exports = {
enabled: false,
name: 'test',
description: 'Test command',
options: [
    {
        name: 'as',
        description: 'The user to test as',
        type: 'USER',
        required: false
    }
],
/**
 * @param { CommandInteraction } interaction The command interaction object.
 * @param { Client } client The discord client that called this command.
 */
async execute(interaction, client) {
    await interaction.deferReply();

    await interaction.editReply(interaction.locale)

}
}