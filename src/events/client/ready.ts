import Discord from "discord.js";
import {
  refreshGlobalCommands,
  refreshGuildCommands,
} from "../../util/guild_init";
import { OverlordEvent } from "../../types/Overlord";
import { DirectMessageManager } from "../../modules/DirectMessageManager";

export = <OverlordEvent>{
  name: "ready",
  once: true,
  async execute(client) {
    const clientGuilds = client.guilds.cache;

    /**
     Function to set Guild commands for all guilds the bot is in
     */
    const setGuildCommands = async () => {
      clientGuilds.forEach(async (guild) => {
        await refreshGuildCommands(client, guild.id);
      });
      console.log("Commands set for all guilds.");
    };

    const setGlobalCommands = async () => {
      await refreshGlobalCommands(client);
    };

    // /**
    //  * Function to fetch information about all guilds the bot is in.
    //  */
    // const fetchGuildForCache = async () => {
    //   for (const guild of clientGuilds.values()) {
    //     await fetchGuildInfo(guild.id, client);
    //   }
    //   console.log("Cache hydrated for all guilds.");
    // };

    const setPresence = () => {
      if (!client.user) return console.log("Client user not found!");
      client.user.setPresence({
        activities: [
          {
            type: Discord.ActivityType.Watching,
            name: "/help",
          },
        ],
        status: "online",
      });
    };

    const createDirectMessageManagers = async () => {
      clientGuilds.forEach(async (guild) => {
        const dmManager = new DirectMessageManager(client, guild);

        client.DirectMessageManagers.set(guild.id, dmManager);
      });
    };

    if (process.env.DEVELOPMENT_MODE === "true")
      console.log(
        "Skipping guild and global command registration due to development mode being enabled."
      );
    else {
      await setGuildCommands();
      await setGlobalCommands();
    }
    await createDirectMessageManagers();
    setPresence();
  },
};
