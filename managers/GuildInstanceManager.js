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
            this.fetchGuild();
        } else {
            throw new Error('Invalid guild passed to GuildInstanceManager.');
        }
    }

    async fetchGuild() {
        const guild = await this.client.guilds.fetch(this.guildId);
        this.guildId = guild.id;
        this.guild = guild;
        await this.guild.channels.fetch(null, true)
        this.emit('guildFetched', guild);
        this.registerSelf();
        return true;
    }

    registerSelf() {
        const instanceRegistry = global.DiscordClient.instanceRegistry
        
        if (instanceRegistry.has(this.guildId)) {
            const activeGuild = instanceRegistry.get(this.guildId);
            activeGuild.guildId = this.guildId;
        } else {
            instanceRegistry.set(this.guildId, { guildId: this.guildId, instanceManager: this, createdAt: new Date() });
        }
        console.log('registered self');
    }
}

module.exports = GuildInstanceManager;