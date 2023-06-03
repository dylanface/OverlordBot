import { SlashCommandBuilder } from "discord.js";
import { OverlordSlashCommand } from "../../types/Overlord";

export = <OverlordSlashCommand>{
  enabled: true,
  name: "ping",
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Check the ping of Overlord in your Guild.")
    .setDMPermission(false),
  async execute(client, interaction) {
    await interaction.deferReply();

    interaction.editReply({
      content: `🏓 Latency is ${
        Date.now() - interaction.createdTimestamp
      }ms. API Latency is ${Math.round(client.ws.ping)}ms`,
    });
  },
};
