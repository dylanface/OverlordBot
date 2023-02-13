const { CommandInteraction, Client } = require("discord.js");
const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

module.exports = {
  enabled: false,
  name: "toggle_regex",
  description: "Enable or Disable Message Regex.",
  data: new SlashCommandSubcommandBuilder()
    .setName("toggle_regex")
    .setDescription("Enable or Disable Message Regex.")
    .addBooleanOption((option) => {
      return option
        .setName("state")
        .setDescription("Enable or Disable Message Regex.")
        .setRequired(true);
    }),
  /**
   * @param { CommandInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    await interaction.deferReply();

    const state = interaction.options.getBoolean("state");
    console.log(state);

    const guild = interaction.guild;
    if (!guild) return;

    const settings = await client.GuildSettingsManager.fetch(guild.id).catch(
      async (err) => {
        console.error(err);
        await interaction.editReply("An error occurred.");
        return;
      }
    );

    settings.editLogs.regex.enabled = state;

    await interaction.editReply(
      `Message Regex is now ${state ? "enabled" : "disabled"}.`
    );
  },
};
