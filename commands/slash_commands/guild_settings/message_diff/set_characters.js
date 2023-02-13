const { CommandInteraction, Client } = require("discord.js");
const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

module.exports = {
  enabled: true,
  name: "set_characters",
  description: "Set the amount of characters required to trigger Message Diff.",
  data: new SlashCommandSubcommandBuilder()
    .setName("set_characters")
    .setDescription(
      "Set the amount of characters required to trigger Message Diff."
    )
    .addIntegerOption((option) => {
      return option
        .setName("characters")
        .setDescription(
          "The amount of characters required to trigger Message Diff."
        )
        .setRequired(true);
    }),
  /**
   * @param { CommandInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    await interaction.deferReply();

    const characters = interaction.options.getInteger("characters");

    const guild = interaction.guild;
    if (!guild) return;

    const settings = await client.GuildSettingsManager.fetch(guild.id).catch(
      async (err) => {
        console.error(err);
        await interaction.editReply("An error occurred.");
        return;
      }
    );

    settings.editLogs.messageDiff.characters = characters;

    await interaction.editReply(
      `Message Diff now requires ${characters} characters.`
    );
  },
};
