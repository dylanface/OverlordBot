const { CommandInteraction, Client } = require("discord.js");
const { SlashCommandSubcommandBuilder } = require("@discordjs/builders");

module.exports = {
  enabled: true,
  name: "view",
  description: "View Guild Settings",
  data: new SlashCommandSubcommandBuilder()
    .setName("view")
    .setDescription("View Guild Settings"),
  /**
   * @param { CommandInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    await interaction.deferReply();

    const guild = interaction.guild;
    if (!guild) return;

    const settings = await client.GuildSettingsManager.fetch(guild.id).catch(
      async (err) => {
        console.error(err);
        await interaction.editReply("An error occurred.");
        return;
      }
    );

    console.log(JSON.stringify(settings.editLogs, null, 2));

    const print = `**Edit Logs**\`\`\`${JSON.stringify(
      settings.editLogs,
      null,
      2
    )}\`\`\` \n **Moderation Logs**\`\`\`${JSON.stringify(
      settings.moderationLogs,
      null,
      2
    )}\`\`\``;

    await interaction.editReply(print);
  },
};
