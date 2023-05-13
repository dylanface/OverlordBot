const {
  registerGuildCommands,
  fetchGuildInfo,
} = require("../../util/guild_init");

module.exports = {
  name: "guildCreate",
  async execute(guild, client) {
    if (!guild.available) return;

    await registerGuildCommands(guild.id, client);
    await fetchGuildInfo(guild.id, client);

    console.log(`Successfully registered guild ${guild.name}.`);
  },
};
