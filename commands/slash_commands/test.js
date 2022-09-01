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

    const profile = await client.UserProfileManager.getProfile(
      interaction.user.id
    );

    profile.setTimezone("America/Los_Angeles");

    await interaction.editReply({
      content: `Your profile is: ${JSON.stringify(profile)}`,
    });
  },
};
