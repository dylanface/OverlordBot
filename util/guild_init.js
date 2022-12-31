const { Routes } = require("discord-api-types/v10");
const { Client } = require("discord.js");
const clientPromise = require("../database/index");

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
  createGuildEntry(guild, client);
  const availableChannels = await guild.channels.fetch(null, { cache: true });

  let pinnedMessageAmount = 0;

  for (let rawChannel of availableChannels) {
    if (rawChannel[1].type === 0) {
      let channel = rawChannel[1];
      channel.messages
        .fetchPinned()
        .then((messages) => (pinnedMessageAmount += messages.size))
        .catch(console.error);
    }
  }
  client.totalMembers += guild.memberCount;

  return {
    availableChannels: availableChannels.size,
    pinnedMessages: pinnedMessageAmount,
  };
}

async function createGuildEntry(guild, client) {
  const guildObject = {
    id: guild.id,
    name: guild.name,
    icon: guild.iconURL(),
    memberCount: guild.memberCount,
    ownerId: guild.ownerId,
    joinedAt: guild.joinedTimestamp,
    prefferedLocale: guild.preferredLocale,
  };

  clientPromise.then(async (c) => {
    const guildCollection = c.db().collection("guilds");

    const result = await guildCollection.updateOne(
      { id: guild.id },
      { $set: guildObject },
      { upsert: true }
    );

    console.log(result);
  });
}

module.exports.createGuildEntry = createGuildEntry;
module.exports.fetchGuildInfo = fetchGuildInfo;
module.exports.registerGuildCommands = registerGuildCommands;
