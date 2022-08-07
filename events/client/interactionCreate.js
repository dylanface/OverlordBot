const { Client, BaseInteraction } = require("discord.js");

module.exports = {
  name: "interactionCreate",
  /**
   *
   * @param {BaseInteraction} interaction The interaction that was triggered
   * @param {Client} client The client that the interaction belongs to
   */
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const sCommandName = interaction.commandName;
      const sCommand = client.slashCommands.get(sCommandName);
      if (!sCommand) return console.log(`Command ${sCommandName} not found`);

      try {
        sCommand.execute(interaction, client);
      } catch (error) {
        console.log(error);
        interaction.reply(
          "There was an error executing the command, please try again later or contact support."
        );
      }
    } else if (interaction.isContextMenuCommand()) {
      const cCommandName = interaction.commandName;
      const cCommand = client.contextMenuCommands.get(cCommandName);
      if (!cCommand)
        return console.log(`Context Menu ${cCommandName} not found`);

      try {
        cCommand.execute(interaction, client);
      } catch (error) {
        console.log(error);
      }
    } else if (interaction.isAutocomplete()) {
      const autocompleteName = interaction.commandName;
      const autocomplete =
        client.autocompleteInteractions.get(autocompleteName);
      if (!autocomplete)
        return console.log(`Autocomplete ${autocompleteName} not found`);

      try {
        autocomplete.execute(interaction, client);
      } catch (error) {
        console.log(error);
      }
    } else return;
  },
};
