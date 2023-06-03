import { BaseInteraction } from "discord.js";
import {
  OverlordClient,
  OverlordCommandType,
  OverlordEvent,
  OverlordSubCommand,
} from "../../types/Overlord";

export = <OverlordEvent>{
  name: "interactionCreate",
  async execute(client, interaction: BaseInteraction) {
    // Slash Commands
    if (interaction.isChatInputCommand()) {
      const sCommandName = interaction.commandName;
      let sCommand: OverlordCommandType =
        client.slashCommands.get(sCommandName);
      if (!sCommand) return console.log(`Command ${sCommandName} not found`);
      if (
        sCommand.config &&
        "hasSubs" in sCommand.config &&
        sCommand.config.hasSubs
      ) {
        const subCommandName = interaction.options.getSubcommand();
        const subCommandGroup = interaction.options.getSubcommandGroup();
        sCommand = client.subCommands.find((cmd) => {
          return (
            cmd.category + "-" + cmd.name ==
            `${subCommandGroup}-${subCommandName}`
          );
        });
        if (!sCommand) {
          console.log(
            `Subcommand ${subCommandGroup}-${subCommandName} not found`
          );
          return interaction.reply({
            content:
              "This subcommand has not been configured yet. Contact an Overlord developer if this is an error.",
            ephemeral: true,
          });
        }
      }

      if (!("execute" in sCommand)) {
        interaction.reply({
          content:
            "There was an error executing the command, please try again later or contact support.",
          ephemeral: true,
        });
        throw new Error("Invalid command reached execcution.");
      }

      sCommand.execute(client, interaction).catch((error: Error) => {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          interaction.editReply(
            "There was an error executing the command, please try again later or contact support."
          );
        } else {
          interaction.reply({
            content:
              "There was an error executing the command, please try again later or contact support.",
            ephemeral: true,
          });
        }
      });
    }

    // Context Menu Commands
    else if (interaction.isContextMenuCommand()) {
      const cCommandName = interaction.commandName;
      const cCommand = client.contextMenuCommands.get(cCommandName);
      if (!cCommand)
        return console.log(`Context Menu ${cCommandName} not found`);

      try {
        cCommand.execute(interaction, client);
      } catch (error) {
        console.log(error);
      }
    }

    // Autocomplete Commands
    else if (interaction.isAutocomplete()) {
      let autocompleteName = "default";

      if (interaction.options.getString("timezone") !== null) {
        autocompleteName = "timezone";
      }
      if (interaction.options.getString("party") !== null) {
        autocompleteName = "party";
      }

      const autocomplete =
        client.autocompleteInteractions.get(autocompleteName);
      if (!autocomplete) return;

      try {
        autocomplete.execute(interaction, client);
      } catch (error) {
        console.log(error);
      }
    } else return;
  },
};
