const { CommandInteraction, Client } = require('discord.js');
const { codeBlock } = require("@discordjs/builders");

module.exports = {
enabled: true,
name: 'test',
description: 'Test command',
/**
 * @param { CommandInteraction } interaction The command interaction object.
 * @param { Client } client The discord client that called this command.
 */
async execute(interaction, client) {
    await interaction.deferReply();

    const testTracker = await client.TrackerController.createTracker(interaction.user)
    .catch((err) => {
        interaction.editReply('Error creating tracker: ' + err.message);
    });

    if (testTracker) await interaction.editReply(codeBlock('JSON' , JSON.stringify(testTracker.toJSON())));

}
}