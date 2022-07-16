const fs = require("fs");
const ascii = require("ascii-table");
let table = new ascii("Context Menu Commands");

table.setHeading("Command", "Status");

module.exports = async (client) => {

    const context_menu_cmd_files = fs.readdirSync("./commands/context_menu_commands").filter(file => file.endsWith(".js"));

    for (const file of context_menu_cmd_files) {
        const context_menu_cmd = require(`../commands/context_menu_commands/${file}`);

        if (context_menu_cmd.name && context_menu_cmd.enabled != false) {
            client.contextMenuCommands.set(context_menu_cmd.name, context_menu_cmd);
            table.addRow(file, "✓");
        }  else {
            table.addRow(file, "✕");
            continue;
        };
    }

    console.log(table.toString());

}