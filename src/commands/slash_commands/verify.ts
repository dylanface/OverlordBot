import { SlashCommandBuilder } from "@discordjs/builders";
import { OverlordSlashCommand } from "../../types/Overlord";
import { generateColoredEmbed } from "../../util/embed_generator";

export = <OverlordSlashCommand>{
  enabled: true,
  name: "verify",
  config: {
    global: true,
  },
  data: new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Verify your Discord account with Overlord."),
  async execute(client, interaction) {
    const inGuild = interaction.inGuild();
    const user = interaction.user;
    const verified = await client.VerificationManager.checkUser(user);
    const embed = generateColoredEmbed();

    if (inGuild) {
      if (verified) {
        embed.setTitle("Overlord Verification");
        embed.setDescription("You are already verified.");
        interaction.reply({ embeds: [embed] });
      } else {
        embed.setTitle("Overlord Verification");
        embed.setDescription(
          "You are not verified, DM Overlord to get verified."
        );
        interaction.reply({ embeds: [embed] });
      }
    } else {
      if (verified) {
        embed.setTitle("Overlord Verification");
        embed.setDescription("You are already verified.");
        interaction.reply({ embeds: [embed] });
      } else {
        await client.VerificationManager.verifyUser(user);
        embed.setTitle("Overlord Verification");
        embed.setDescription(
          "You are now verified and able to recieve DMs from Overlord. Overlord will only sends DMs to you when you use a command that requires it or are subject to a moderation action."
        );
        interaction.reply({ embeds: [embed] });
      }
    }
  },
};
