const { AutocompleteInteraction, Client } = require("discord.js");
const { Timezones } = require("../../json/timezones/timezones.js");

module.exports = {
  enabled: true,
  name: "timezone",
  /**
   * @param { AutocompleteInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    const timezones = new Timezones();

    const query = interaction.options.getFocused();
    // console.log(query);

    const results = timezones.search(query);

    if (results.length == 0) return await interaction.respond([]);

    const send = [];
    for (i = 0; i < 25 && i < results.length; i++) {
      send.push({
        name: results[i],
        value: results[i],
      });
    }

    await interaction.respond(send);
  },
};
