const fs = require("fs");

module.exports = async (client) => {

    const context_menu_cmd_files = fs.readdirSync("./commands/context_menu_commands").filter(file => file.endsWith(".js"));

    for (const file of context_menu_cmd_files) {
        const context_menu_cmd = require(`../commands/context_menu_commands/${file}`);

        if (context_menu_cmd.name && context_menu_cmd.enabled != false) {
            console.log(`Registering context menu command: ${context_menu_cmd.name}`);
            client.contextMenuCommands.set(context_menu_cmd.name, context_menu_cmd);
        }  else continue;
    }

}