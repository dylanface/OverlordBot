import { OverlordEvent } from "../../types/Overlord";
import { refreshGuildCommands } from "../../util/guild_init";

export = <OverlordEvent>{
  name: "guildCreate",
  async execute(client, guild) {
    if (!guild.available) return;

    await refreshGuildCommands(client, guild.id);

    console.log(`Successfully registered guild ${guild.name}.`);
  },
};
