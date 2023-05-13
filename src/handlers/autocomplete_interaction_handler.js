const fs = require("fs");
const path = require("node:path");
const ascii = require("ascii-table");
let table = new ascii("Autocomplete");

table.setHeading("Option Name", "Status");

const autocomplete_dir = path.join(
  __dirname,
  "../commands/autocomplete_interactions"
);

module.exports = async (client) => {
  const autocomplete_files = fs
    .readdirSync(autocomplete_dir)
    .filter((file) => file.endsWith(".js"));

  for (const file of autocomplete_files) {
    const autocomplete = require(`${autocomplete_dir}/${file}`);
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
