import { OverlordSubCommand } from "../../../types/Overlord";
import { SlashCommandSubcommandBuilder } from "@discordjs/builders";

export = <OverlordSubCommand>{
  enabled: true,
  name: "view",
  data: new SlashCommandSubcommandBuilder()
    .setName("view")
    .setDescription("View Guild Settings"),
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    if (!guild) throw new Error("Guild could not be found on Interaction.");

    const settings = await client.GuildSettingsManager.fetch(guild.id);

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
