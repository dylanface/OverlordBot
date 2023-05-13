const fs = require("fs");
const path = require("node:path");
const ascii = require("ascii-table");
let table = new ascii("Events");

table.setHeading("Event", "Status", "Once");

const event_dir = path.join(__dirname, "../events");

module.exports = async (client) => {
  const load_dir = (dirs) => {
    const event_files = fs
      .readdirSync(`${event_dir}/${dirs}`)
      .filter((file) => file.endsWith(".js"));

    for (const file of event_files) {
      const event = require(`${event_dir}/${dirs}/${file}`);
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
      } else {
        client.on(event.name, (...args) => event.execute(...args, client));
      }
      table.addRow(file, "✓", event.once ? "✓" : "✕");
    }

    console.log(table.toString());
  };

  load_dir("client");
};
