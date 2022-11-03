const { CommandInteraction, Client } = require("discord.js");
const {
  SlashCommandSubcommandBuilder,
  SlashCommandStringOption,
} = require("@discordjs/builders");

module.exports = {
  enabled: true,
  name: "set_timezone",
  data: new SlashCommandSubcommandBuilder()
    .setName("set_timezone")
    .setDescription("Set your preferred timezone when using PartyPlanner.")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("timezone")
        .setDescription("Your preferred timezone.")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  /**
   * @param { CommandInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    await interaction.deferReply();

    const timezone = interaction.options.getString("timezone");

    const profile = await client.UserProfileManager.getProfile(
      interaction.user.id
    );

    profile.setTimezone(timezone);

    await interaction.editReply("Your preferred timezone is " + timezone + ".");
  },
};
