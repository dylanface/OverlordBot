import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { OverlordSubCommand } from "../../../../types/Overlord";

export = <OverlordSubCommand>{
  enabled: true,
  name: "toggle",
  data: new SlashCommandSubcommandBuilder()
    .setName("toggle")
    .setDescription("Enable or Disable Message Diff.")
    .addBooleanOption((option) => {
      return option
        .setName("state")
        .setDescription("Enable or Disable Message Diff.");
    }),
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    const state = interaction.options.getBoolean("state");

    const guild = interaction.guild;
    if (!guild) throw new Error("Guild could not be found on Interaction.");

    const settings = await client.GuildSettingsManager.fetch(guild.id);

    if (!state) {
      settings.editLogs.messageDiff.enabled =
        !settings.editLogs.messageDiff.enabled;
    } else {
      settings.editLogs.messageDiff.enabled = state;
    }

    await interaction.editReply(
      `Message Diff is now ${
        settings.editLogs.messageDiff.enabled ? "enabled" : "disabled"
      }.`
    );
  },
};
