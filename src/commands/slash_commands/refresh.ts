import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { OverlordSlashCommand } from "../../types/Overlord";
import {
  refreshGlobalCommands,
  refreshGuildCommands,
} from "../../util/guild_init";

export = <OverlordSlashCommand>{
  enabled: true,
  name: "refresh",
  data: new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Refresh Overlord commands.")
    .addBooleanOption((option) =>
      option.setName("global").setDescription("Refresh global commands?")
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.guild || interaction.guild === null)
      throw new Error("Guild not found, please contact support.");

    await interaction.editReply({ content: "Refreshing commands..." });

    await refreshGuildCommands(client, interaction.guild.id);

    if (interaction.options.getBoolean("global"))
      await refreshGlobalCommands(client);

    await interaction.editReply({ content: "Commands refreshed!" });
  },
};
