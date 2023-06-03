import fs from "fs";
import path from "node:path";
import {
  SlashCommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from "@discordjs/builders";

import { AsciiTable3 } from "ascii-table3";
import { PermissionFlagsBits } from "discord.js";
import {
  OverlordClient,
  OverlordSlashCommand,
  OverlordSubCommand,
  OverlordSubCommandGroup,
} from "../types/Overlord";

let slashCommandsTable = new AsciiTable3("Slash Commands");
let subCommandsTable = new AsciiTable3("Sub Commands");

slashCommandsTable.setHeading("Command", "Status");
subCommandsTable.setHeading("Command", "Status");

const slash_cmd_dir = path.join(__dirname, "../commands/slash_commands");

export = async (client: OverlordClient) => {
  const slash_cmd_files = fs
    .readdirSync(slash_cmd_dir)
    .filter((file) => file.endsWith(".js"));

  const slash_subcmd_files = fs
    .readdirSync(slash_cmd_dir)
    .filter((file) => !file.includes("."));

  // Search for and register slash commands
  for (const cmd_file of slash_cmd_files) {
    const sCommand: OverlordSlashCommand = require(`${slash_cmd_dir}/${cmd_file}`);

    if (sCommand.name && sCommand.enabled === true) {
      client.slashCommands.set(sCommand.name, sCommand);
      slashCommandsTable.addRow(cmd_file, "✓");
    } else if (sCommand.name && sCommand.enabled === false) {
      slashCommandsTable.addRow(cmd_file, "✕");
      continue;
    } else continue;
  }

  // Search for and register slash commands with sub commands
  for (const subcmd_dir of slash_subcmd_files) {
    const insideDir = fs
      .readdirSync(`${slash_cmd_dir}/${subcmd_dir}`)
      .filter((file) => file.endsWith(".js"));
    if (insideDir.length <= 0) continue;

    const builtCommand = new SlashCommandBuilder()
      .setName(subcmd_dir)
      .setDescription(`The home of ${subcmd_dir} related commands.`);

    if (subcmd_dir === "guild_settings") {
      builtCommand.setDMPermission(false);
      builtCommand.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);
    }

    for (const cmd of insideDir) {
      const subCommand: OverlordSubCommand = require(`${slash_cmd_dir}/${subcmd_dir}/${cmd}`);

      if (subCommand.name && subCommand.data && subCommand.enabled === true) {
        subCommand.category = "null";
        client.subCommands.set(
          `${subCommand.category}-${subCommand.name}`,
          subCommand
        );
        subCommandsTable.addRow(cmd, "✓");
        builtCommand.addSubcommand(subCommand.data);
      } else continue;
    }

    // Search for and register sub command categories in the local directory and their sub commands.
    const commandCategories = fs
      .readdirSync(`${slash_cmd_dir}/${subcmd_dir}`)
      .filter((file) => !file.includes("."));

    for (const category of commandCategories) {
      const commands = fs
        .readdirSync(`${slash_cmd_dir}/${subcmd_dir}/${category}`)
        .filter((file) => file.endsWith(".js") && file !== "index.js");
      if (commands.length <= 0) continue;

      let group = new SlashCommandSubcommandGroupBuilder()
        .setName(category)
        .setDescription(
          `The home of ${subcmd_dir} ${category} related commands.`
        );

      // console.log(commands);

      for (const cmd of commands) {
        const cmdModule = require(`${slash_cmd_dir}/${subcmd_dir}/${category}/${cmd}`);

        if (cmdModule.enabled === true && cmdModule.name && cmdModule.data) {
          cmdModule.category = category;
          client.subCommands.set(
            `${cmdModule.category}-${cmdModule.name}`,
            cmdModule
          );
          subCommandsTable.addRow(cmd, "✓");
          group.addSubcommand(cmdModule.data);
        } else continue;
      }

      builtCommand.addSubcommandGroup(group);
    }

    const builtSubCommandGroup: OverlordSubCommandGroup = {
      name: subcmd_dir,
      config: { hasSubs: true },
      data: builtCommand,
    };
    client.slashCommands.set(subcmd_dir, builtSubCommandGroup);
    slashCommandsTable.addRow(subcmd_dir, "✓");
  }

  // Only uncomment in development mode
  console.log(`\n${client.slashCommands.size} slash commands loaded.`);
  console.log(`\n${client.subCommands.size} sub commands loaded.`);

  console.log(slashCommandsTable.toString());
  console.log(subCommandsTable.toString());
};
