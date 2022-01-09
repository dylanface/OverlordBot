const InstanceManager = require("./InstanceManager");

class GuildInstanceManager extends InstanceManager {
    guild;
    constructor(
        guild,
        client
    ) {
        super(client);

        if (typeof guild === 'string' || typeof guild === 'number') {
            this.guildId = guild;
            this.fetchGuild();
        } else if (typeof guild === 'object') {
            this.guildId = guild.id;
            this.guild = guild;
        } else {
            throw new Error('Invalid guild passed to GuildInstanceManager.');
        }
    }

    async fetchGuild() {
        const guild = await this.client.guilds.fetch(this.guildId);
        await this.guild.channels.fetch(null, true)
        this.guild = guild;
        this.guildId = guild.id;
        return this.emit('guildFetched', guild);
    }
}

module.exports = GuildInstanceManager;