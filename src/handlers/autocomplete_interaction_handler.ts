import fs from "fs";
import path from "node:path";
import { AsciiTable3 } from "ascii-table3";
import {
  OverlordAutocompleteInteraction,
  OverlordClient,
} from "../types/Overlord";
let table = new AsciiTable3("Autocomplete");

table.setHeading("Option Name", "Status");

const autocomplete_dir = path.join(
  __dirname,
  "../commands/autocomplete_interactions"
);

export = async (client: OverlordClient) => {
  const autocomplete_files = fs
    .readdirSync(autocomplete_dir)
    .filter((file) => file.endsWith(".js"));

  for (const file of autocomplete_files) {
    const autocomplete: OverlordAutocompleteInteraction = require(`${autocomplete_dir}/${file}`);
    if (autocomplete.name && autocomplete.enabled != false) {
      client.autocompleteInteractions.set(autocomplete.name, autocomplete);
      table.addRow(file, "✓");
    } else if (autocomplete.name && autocomplete.enabled === false) {
      table.addRow(file, "✕");
      continue;
    } else continue;
  }

  console.log(table.toString());
};
