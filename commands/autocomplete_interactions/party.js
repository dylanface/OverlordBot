const { AutocompleteInteraction, Client } = require("discord.js");

module.exports = {
  enabled: true,
  name: "party",
  /**
   * @param { AutocompleteInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    const query = interaction.options.getFocused();
    // console.log(query);

    const results = [];
    client.PartyPlanner._cache.forEach((party) => {
      if (
        party.title.toLowerCase().includes(query.toLowerCase()) ||
        query.length === 0
      ) {
        results.push({
          name: party.title,
          value: party.uuid,
        });
      }
    });

    if (results.length == 0) return await interaction.respond([]);

    // const send = [];
    // for (i = 0; i < 25 && i < results.length; i++) {
    //   send.push({
    //     name: results[i].name,
    //     value: results[i].value,
    //   });
    // }
    results.sort();

    await interaction.respond(results);
  },
};
