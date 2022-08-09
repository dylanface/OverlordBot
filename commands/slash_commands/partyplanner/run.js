const { CommandInteraction, Client } = require("discord.js");
const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

module.exports = {
  enabled: true,
  name: "run",
  data: new SlashCommandSubcommandBuilder()
    .setName("run")
    .setDescription("Run the current test for PartyPlanner."),
  /**
   * @param { CommandInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    await interaction.reply(
      "Test sub command executed by: " + interaction.user.tag
    );
  },
};
