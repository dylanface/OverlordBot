import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { OverlordSubCommand } from "../../../../types/Overlord";

export = <OverlordSubCommand>{
  enabled: true,
  name: "toggle",
  data: new SlashCommandSubcommandBuilder()
    .setName("toggle")
    .setDescription("Enable or Disable edit logs.")
    .addBooleanOption((option) => {
      return option
        .setName("state")
        .setDescription("Enable or Disable edit logs.");
    }),
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    const state = interaction.options.getBoolean("state");
    // console.log(state);

    const guild = interaction.guild;
    if (!guild) throw new Error("Guild could not be found on Interaction.");

    const settings = await client.GuildSettingsManager.fetch(guild.id);

    if (!state) {
      settings.editLogs.enabled = !settings.editLogs.enabled;
    } else {
      settings.editLogs.enabled = state;
    }

    await interaction.editReply(
      `Edit logs are now ${settings.editLogs.enabled ? "enabled" : "disabled"}.`
    );
  },
};
