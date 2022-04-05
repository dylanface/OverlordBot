const InstanceManager = require("./InstanceManager");
const Discord = require("discord.js");

/**
 * An Instance Manager that will latch to a Discord Guild.
 * @extends InstanceManager
 */
class GuildInstanceManager extends InstanceManager {

    /**
     * 
     * The Discord Guild that has been latched onto.
     * @type {Discord.Guild}
     */
    guild;

    /**
     *
     * @constructor
     * @param { Discord.Guild | String | Number } guild - The guild to be managed.
     * @param { Discord.Client } client - The current active bot client.
     */
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

    /**
     * Fetches the guild from the Discord Client and latches.
     * @returns {Boolean} The guild that was latched onto.
     */
    async fetchGuild() {
        const guild = await this.client.guilds.fetch(this.guildId);
        this.guildId = guild.id;
        this.guild = guild;
        await this.guild.channels.fetch(null, true)
        this.emit('guildFetched', guild);
        this.registerSelf();
        return;
    }

    /**
     * Registers the GuildInstanceManager to the global Discord Client.
     */
    registerSelf() {
        const instanceRegistry = global.DiscordClient.instanceRegistry
        
        if (instanceRegistry.has(this.guildId)) {
            const activeGuild = instanceRegistry.get(this.guildId);
            activeGuild.guildId = this.guildId;
        } else {
            instanceRegistry.set(this.guildId, { guildId: this.guildId, instanceManager: this, createdAt: new Date() });
        }
        return;
    }




}

module.exports = GuildInstanceManager;