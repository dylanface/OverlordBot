const { Routes } = require("discord-api-types/v10");
const { Client } = require("discord.js");

/**
 * Register commands for a guild.
 * @param {string} guildId The guild ID in snowflake form.
 * @param {Client} client The discord client that called this command.
 */
async function registerGuildCommands(guildId, client) {
  const slashCommands = await client.slashCommands.map((command) => {
    return command.data.toJSON();
  });

  const contextMenuCommands = await client.contextMenuCommands.map(
    (command) => {
      return command.data.toJSON();
    }
  );

  const commands = [...slashCommands, ...contextMenuCommands];

  try {
    console.log("Started refreshing guild (/) commands.");

    await client.REST.put(
      Routes.applicationGuildCommands(client.application.id, guildId),
      { body: commands }
    );

    console.log(`Successfully reloaded guild (/) commands for ${guildId}.`);
  } catch (error) {
    console.error(error);
  }
}

async function fetchGuildInfo(guildId, client) {
  const guild = await client.guilds.cache.get(guildId);
  if (!guild.available) return;
  const availableChannels = await guild.channels.fetch(null, { cache: true });
  client.totalMembers += guild.memberCount;

  return availableChannels.size;
}

module.exports.fetchGuildInfo = fetchGuildInfo;
module.exports.registerGuildCommands = registerGuildCommands;
