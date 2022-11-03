const { CommandInteraction, Client } = require("discord.js");
const {
  SlashCommandSubcommandBuilder,
  SlashCommandStringOption,
} = require("@discordjs/builders");

module.exports = {
  enabled: true,
  name: "register",
  data: new SlashCommandSubcommandBuilder()
    .setName("register")
    .setDescription("Create a PartyPlanner profile."),
  /**
   * @param { CommandInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    await interaction.deferReply();

    const profile = await client.UserProfileManager.getProfile(
      interaction.user.id
    );

    await interaction.editReply({
      content: `Your profile is: ${JSON.stringify(profile)}`,
    });
  },
};
