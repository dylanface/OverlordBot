const { CommandInteraction, Client } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  enabled: false,
  name: "test",
  description: "Test command",
  data: new SlashCommandBuilder()
    .setName("test")
    .setDescription("Test Command")
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand.setName("gamer").setDescription("Info about a user")
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("ping").setDescription("Ping command")
    ),
  /**
   * @param { CommandInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    await interaction.reply(
      "Test command executed by: " + interaction.user.tag
    );
  },
};
