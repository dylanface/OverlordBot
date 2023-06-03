import fs from "fs";
import path from "node:path";
import { AsciiTable3 } from "ascii-table3";
import { OverlordClient } from "../types/Overlord";
let table = new AsciiTable3("Context Menu Commands");

table.setHeading("Command", "Status");

const context_menu_cmd_dir = path.join(
  __dirname,
  "../commands/context_menu_commands"
);

export = async (client: OverlordClient) => {
  const context_menu_cmd_files = fs
    .readdirSync(context_menu_cmd_dir)
    .filter((file) => file.endsWith(".js"));

  for (const file of context_menu_cmd_files) {
    const context_menu_cmd = require(`${context_menu_cmd_dir}/${file}`);

    if (context_menu_cmd.name && context_menu_cmd.enabled != false) {
      client.contextMenuCommands.set(context_menu_cmd.name, context_menu_cmd);
      table.addRow(file, "✓");
    } else {
      table.addRow(file, "✕");
      continue;
    }
  }

  console.log(table.toString());
};
