import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { OverlordSlashCommand } from "../../types/Overlord";
import { refreshGuildCommands } from "../../util/guild_init";

export = <OverlordSlashCommand>{
  enabled: true,
  name: "refresh",
  data: new SlashCommandBuilder()
    .setName("refresh")
    .setDescription("Refresh commands for your Guild.")
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.guild || interaction.guild === null)
      throw new Error("Guild not found, please contact support.");

    await interaction.editReply({ content: "Refreshing commands..." });

    await refreshGuildCommands(client, interaction.guild.id);
    await interaction.editReply({ content: "Commands refreshed!" });
  },
};
