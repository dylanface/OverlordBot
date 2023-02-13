const fs = require("fs");

const {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} = require("@discordjs/builders");

const ascii = require("ascii-table");
const { PermissionFlagsBits } = require("discord.js");
let slashCommandsTable = new ascii("Slash Commands");
let subCommandsTable = new ascii("Sub Commands");

slashCommandsTable.setHeading("Command", "Status");
subCommandsTable.setHeading("Command", "Status");

module.exports = async (client) => {
  const slash_cmd_files = fs
    .readdirSync("./commands/slash_commands")
    .filter((file) => file.endsWith(".js"));

  const slash_subcmd_files = fs
    .readdirSync("./commands/slash_commands")
    .filter((file) => !file.includes("."));

  // Search for and register slash commands
  for (const cmd_file of slash_cmd_files) {
    const sCommand = require(`../commands/slash_commands/${cmd_file}`);

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
      .readdirSync(`./commands/slash_commands/${subcmd_dir}`)
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
      const subCommand = require(`../commands/slash_commands/${subcmd_dir}/${cmd}`);

      if (subCommand.name && subCommand.data && subCommand.enabled === true) {
        client.subCommands.set(subCommand.name, subCommand);
        subCommandsTable.addRow(cmd, "✓");
        builtCommand.addSubcommand(subCommand.data);
      } else continue;
    }

    // Search for and register sub command categories in the local directory and their sub commands.
    const commandCategories = fs
      .readdirSync(`./commands/slash_commands/${subcmd_dir}`)
      .filter((file) => !file.includes("."));

    for (const category of commandCategories) {
      const commands = fs
        .readdirSync(`./commands/slash_commands/${subcmd_dir}/${category}`)
        .filter((file) => file.endsWith(".js") && file !== "index.js");
      if (commands.length <= 0) continue;

      let group = new SlashCommandSubcommandGroupBuilder()
        .setName(category)
        .setDescription(
          `The home of ${subcmd_dir} ${category} related commands.`
        );

      for (const cmd of commands) {
        const cmdModule = require(`../commands/slash_commands/${subcmd_dir}/${category}/${cmd}`);

        if (cmdModule.enabled === true && cmdModule.name && cmdModule.data) {
          client.subCommands.set(cmdModule.name, cmdModule);
          subCommandsTable.addRow(cmd, "✓");
          group.addSubcommand(cmdModule.data);
        } else continue;
      }

      builtCommand.addSubcommandGroup(group);
    }
    const mockCommand = {
      name: subcmd_dir,
      hasSubs: true,
      data: builtCommand,
    };
    client.slashCommands.set(subcmd_dir, mockCommand);
    slashCommandsTable.addRow(subcmd_dir, "✓");
  }
  // else {
  //   const mainCommand = require(`../commands/slash_commands/${subcmd_file}/index.js`);

  //   if (mainCommand.enabled === true) {
  //     mainCommand.hasSubs = true;
  //     client.slashCommands.set(subcmd_file, mainCommand);
  //   } else continue;

  //   const whereIsIndex = subdir.indexOf("index.js");
  //   subdir.splice(whereIsIndex, 1);
  // }

  // for (const sub_cmd of subdir) {
  //   const subCommand = require(`../commands/slash_commands/${subcmd_file}/${sub_cmd}`);

  //   if (subCommand.enabled === true && subCommand.name) {
  //     client.subCommands.set(subCommand.name, subCommand);
  //     subCommandsTable.addRow(sub_cmd, "✓");
  //   } else if (subCommand.name && subCommand.enabled === false) {
  //     subCommandsTable.addRow(sub_cmd, "✕");
  //     continue;
  //   } else continue;
  // }

  console.log(slashCommandsTable.toString());
  console.log(subCommandsTable.toString());
};
