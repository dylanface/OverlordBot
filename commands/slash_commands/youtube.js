const { CommandInteraction, Client } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
  enabled: false,
  name: "youtube",
  description: "Watch youtube videos with the help of Discord-Together!",
  data: new SlashCommandBuilder()
    .setName("youtube")
    .setDescription("Watch youtube videos with the help of Discord-Together!")
    .setDMPermission(false),
  /**
   * @param { CommandInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    if (interaction.member.voice.channel) {
      await client.discordTogether
        .createTogetherCode(interaction.member.voice.channelId, "youtube")
        .then(async (invite) => {
          return interaction.reply(`<${invite.code}> ← Click Me!`);
        });
    } else {
      interaction.reply("You must be in a voice channel to use this command!");
    }
  },
};
