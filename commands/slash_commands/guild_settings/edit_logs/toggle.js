const { CommandInteraction, Client } = require("discord.js");
const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

module.exports = {
  enabled: true,
  name: "toggle",
  description: "Enable or Disable edit logs.",
  data: new SlashCommandSubcommandBuilder()
    .setName("toggle")
    .setDescription("Enable or Disable edit logs.")
    .addBooleanOption((option) => {
      return option
        .setName("state")
        .setDescription("Enable or Disable edit logs.")
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

    settings.editLogs.enabled = state;

    await interaction.editReply(
      `Edit logs are now ${state ? "enabled" : "disabled"}.`
    );
  },
};
