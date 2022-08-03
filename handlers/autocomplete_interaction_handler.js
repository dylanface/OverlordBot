const fs = require("fs");
const ascii = require("ascii-table");
let table = new ascii("Autocomplete");

table.setHeading("Option Name", "Status");

module.exports = async (client) => {
  const autocomplete_files = fs
    .readdirSync("./commands/autocomplete_interactions")
    .filter((file) => file.endsWith(".js"));

  for (const file of autocomplete_files) {
    const autocomplete = require(`../commands/autocomplete_interactions/${file}`);
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
