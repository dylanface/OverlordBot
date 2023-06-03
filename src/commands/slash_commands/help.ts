import { SlashCommandBuilder } from "discord.js";
import { OverlordSlashCommand } from "../../types/Overlord";

export = <OverlordSlashCommand>{
  name: "help",
  enabled: true,
  config: {
    help: {},
  },
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get help with the Overlord slash commands")
    .addStringOption((option) => {
      return option
        .setName("command")
        .setDescription("The command you want help with")
        .setRequired(false);
    }),
  execute: async (client, interaction) => {
    await interaction.deferReply({ ephemeral: true });
    const command_name = interaction.options.getString("command");
    if (!command_name) {
      const commands = client.slashCommands.map((command) => {
        return {
          name: command.name,
          value: command.data.description,
        };
      });
      await interaction.editReply({
        embeds: [
          {
            title: "Overlord Slash Commands",
            fields: commands,
          },
        ],
      });
    } else {
      const command = client.slashCommands.get(command_name);
      if (!command) {
        await interaction.editReply({
          content: "I could not find that command 🤷.",
        });
      } else {
        if (command?.config?.help) {
        } else {
          let usage_string = `${command.name}`;
          for (const option of command.data.options) {
            const resolved_option = option.toJSON();
            usage_string += ` ${resolved_option.name}`;
          }
          await interaction.editReply({
            embeds: [
              {
                title: command.name,
                description: command.data.description,
                fields: [
                  {
                    name: "Usage",
                    value: "help",
                  },
                ],
              },
            ],
          });
        }
      }
    }
  },
};
