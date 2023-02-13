const { CommandInteraction, Client } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  enabled: true,
  name: "test",
  description: "Test command",
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Test Command")
    .setDMPermission(false),
  /**
   * @param { CommandInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    await interaction.deferReply();

    const settings = await client.GuildSettingsManager.fetch(
      "869137600282259466"
    ).catch((err) => {
      console.error(err);
      console.log(err.message);
    });

    settings.editLogs.regex.enabled = false;

    await interaction.editReply("Done!");
  },
};
