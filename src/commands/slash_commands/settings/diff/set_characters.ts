import { SlashCommandSubcommandBuilder } from "@discordjs/builders";
import { OverlordSubCommand } from "../../../../types/Overlord";

export = <OverlordSubCommand>{
  enabled: true,
  name: "set",
  description: "Set the amount of characters required to trigger Message Diff.",
  data: new SlashCommandSubcommandBuilder()
    .setName("set")
    .setDescription("Set the amount of words required to trigger Message Diff.")
    .addIntegerOption((option) => {
      return option
        .setName("words")
        .setDescription("The amount of words required to trigger Message Diff.")
        .setRequired(true);
    }),
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    const words = interaction.options.getInteger("words");
    if (!words) throw new Error("No word count provided.");

    const guild = interaction.guild;
    if (!guild) throw new Error("Guild could not be found on Interaction.");

    const settings = await client.GuildSettingsManager.fetch(guild.id);

    settings.editLogs.messageDiff.characters = words;

    await interaction.editReply(`Message Diff now requires ${words} words.`);
  },
};
