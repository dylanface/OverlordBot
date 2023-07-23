import { SlashCommandBuilder } from "@discordjs/builders";
import { OverlordSlashCommand } from "../../types/Overlord";
import { generateColoredEmbed } from "../../util/embed_generator";
// import { }

export = <OverlordSlashCommand>{
  enabled: true,
  name: "reload",
  config: {},
  data: new SlashCommandBuilder()
    .setName("reload")
    .setDescription("Reload a commands execution file.")
    .addStringOption((option) =>
      option
        .setName("command")
        .setDescription("The command to reload.")
        .setRequired(true)
    ),
  async execute(client, interaction) {
    const commandName = interaction.options
      .getString("command", true)
      .toLowerCase();

    const command = client.slashCommands.get(commandName);

    if (!command) throw new Error(`Command "${commandName}" not found.`);
    if (command.name === "reload")
      throw new Error("The reload command can not reload itself.");

    if (command.name === "settings") {
      throw new Error("The settings command group can not be reloaded.");
    }

    delete require.cache[require.resolve(`./${command.name}.js`)];

    try {
      client.slashCommands.delete(command.name);
      const newCommand = require(`./${command.name}.js`);
      client.slashCommands.set(newCommand.name, newCommand);
    } catch (error) {
      throw new Error(
        `There was an error while reloading the "${command.name}" command`
      );
    }

    const embed = generateColoredEmbed().setDescription(
      `Reloaded ${command.name} successfully.`
    );

    await interaction.reply({
      embeds: [embed],
    });
  },
};
