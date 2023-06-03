import { OverlordClient } from "../types/Overlord";

import { Routes } from "discord-api-types/v10";
import clientPromise from "../database/index";

/**
 * Register commands for a guild.
 */
export async function refreshGuildCommands(
  client: OverlordClient,
  guildId: string
) {
  const slashCommands = client.slashCommands.map((command) => {
    return command.data.toJSON();
  });

  const contextMenuCommands = client.contextMenuCommands.map((command) => {
    return command.data.toJSON();
  });

  const commands = [...slashCommands, ...contextMenuCommands];

  try {
    console.log(`Refreshing ${commands.length} commands for ${guildId}.`);

    await client.REST.put(
      Routes.applicationGuildCommands(
        client.application?.id as string,
        guildId
      ),
      { body: commands }
    );

    console.log(`Successfully reloaded guild (/) commands for ${guildId}.`);
  } catch (error) {
    console.error(error);
  }
}

// /**
//  * Fetch guild all available channels and their pinned messages.
//  */
// async function fetchGuildInfo(guildId: string, client: OverlordClient) {
//   const guild = client.guilds.cache.get(guildId);
//   if (!guild?.available) return;
//   createGuildEntry(guild, client);
//   const availableChannels = await guild.channels.fetch("", { cache: true });
//   if (!availableChannels) return;

//   let pinnedMessageAmount = 0;

//   for (let rawChannel of availableChannels) {
//     if (rawChannel[1].type === 0) {
//       let channel = rawChannel[1];
//       channel.messages
//         .fetchPinned()
//         .then((messages) => (pinnedMessageAmount += messages.size))
//         .catch(console.error);
//     }
//   }
//   client.totalMembers += guild.memberCount;

//   return;
// }

// async function createGuildEntry(guild, client) {
//   let result;
//   const guildObject = {
//     id: guild.id,
//     name: guild.name,
//   };

//   await clientPromise.then(async (c) => {
//     const guildCollection = c.db().collection("guilds");

//     result = await guildCollection.updateOne(
//       { id: guild.id },
//       { $set: guildObject },
//       { upsert: true }
//     );
//   });

//   if (result?.upsertedId) {
//     console.log(`Added guild ${guild.name} to the database.`);
//     client.GuildSettingsManager.addGuildSettings(guild.id);
//   }
// }
