import { AutocompleteInteraction, Client } from "discord.js";
import { Timezones } from "../../../json/timezones/timezones.js";
import { OverlordAutocompleteInteraction } from "../../types/Overlord.js";

export = <OverlordAutocompleteInteraction>{
  enabled: true,
  name: "timezone",
  async execute(client, interaction) {
    const timezones = new Timezones();

    const query = interaction.options.getFocused();

    const results = timezones.search(query);

    if (results.length == 0) return await interaction.respond([]);

    const send = [];
    for (let i = 0; i < 25 && i < results.length; i++) {
      send.push({
        name: results[i],
        value: results[i],
      });
    }

    await interaction.respond(send);
  },
};
