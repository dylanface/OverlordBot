const { CommandInteraction, Client } = require("discord.js");
const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

module.exports = {
  enabled: true,
  name: "toggle_diff",
  description: "Enable or Disable Message Diff.",
  data: new SlashCommandSubcommandBuilder()
    .setName("toggle_diff")
    .setDescription("Enable or Disable Message Diff.")
    .addBooleanOption((option) => {
      return option
        .setName("state")
        .setDescription("Enable or Disable Message Diff.")
        .setRequired(true);
    }),
  /**
   * @param { CommandInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    await interaction.deferReply();

    const state = interaction.options.getBoolean("state");

    const guild = interaction.guild;
    if (!guild) return;

    const settings = await client.GuildSettingsManager.fetch(guild.id).catch(
      async (err) => {
        console.error(err);
        await interaction.editReply("An error occurred.");
        return;
      }
    );

    settings.editLogs.messageDiff.enabled = state;

    await interaction.editReply(
      `Message Diff is now ${state ? "enabled" : "disabled"}.`
    );
  },
};
