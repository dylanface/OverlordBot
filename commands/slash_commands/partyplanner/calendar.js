const { CommandInteraction, Client } = require("discord.js");
const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

module.exports = {
  enabled: true,
  name: "calendar",
  data: new SlashCommandSubcommandBuilder()
    .setName("calendar")
    .setDescription("View the calendar of upcoming community events."),
  /**
   * @param { CommandInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {},
};
