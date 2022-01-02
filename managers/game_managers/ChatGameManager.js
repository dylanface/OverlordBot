const Discord = require('discord.js');
const WordScramble = require('./Games/WordScramble');


/**
* Manages instances of a chat game manager for each Guild.
*/
class ChatGameManager {
    constructor(
        client
    ) {
        this.client = client;
        this.guildGameManagers = new Discord.Collection();
    }

    /** 
    * Fetch an instance of a Guild Manager for a specified guild, if it does not exist create one.
    */
    async getGuildChatGameManager(guildId) {
        const manager = this.guildGameManagers.get(guildId);
        if (manager) return manager;
        else return await this.addGuild(guildId);
    }

    /** 
    * Backend function to create and register a Guild Chat Game Manager..
    */
    async addGuild(guildId) {
        const gameManager = new GuildChatGameManager(this, guildId, this.client);
        this.guildGameManagers.set(guildId, gameManager);
        return gameManager;
    }

    /** 
    * Backend function to remove the specified Guild Manager from the Head Manager cache.
    */
    async removeGuild(guildId) {
        const gameManager = this.guildGameManagers.get(guildId);
        if (gameManager) {
            gameManager.destroy();
            this.guildGameManagers.delete(guildId);
            return true;
        }

    }
    
    async syncGuild(guildId, manager) {
        this.guildGameManagers.set(guildId, manager);
    }

    async refreshGuild(guildId) {
        const gameManager = this.guildGameManagers.get(guildId);
        gameManager.beginChallenge();
    }

    
}








/**
* Manages chat games that take place inside the created Guild Manager.
*/
class GuildChatGameManager /* extends GameManager */ {
    constructor(
        manager,
        guildId
    ) {
        // super(null, manager, null, 'chat_based', null, null, guildId, client);
        this.client = manager.client;
        this.guildId = guildId;
        this.manager = manager;
        this.matchCache = new Discord.Collection();

        this.fetchGuild()
    }
    
    /** 
    * Asynchronously fetch the Guild object and tie it to this Guild Chat Game Manager.
    */
    async fetchGuild() {
        const guild = await this.client.guilds.fetch(this.guildId);
        this.guild = guild;
        await this.guild.channels.fetch(null, true)
        console.log(`Guild Chat Game Manager for ${this.guild.name} has been created.`);
        return this.guild;
    }
    
    
    /** 
    * Backend function to choose a random channel that all Guild Users can chat in.
    */
    async pickRandomChannel() {
        const everyone = this.guild.roles.everyone;
        const channels = await this.guild.channels.cache.filter(c => c.type === 'GUILD_TEXT' && c.permissionsFor(everyone).has('SEND_MESSAGES'));
        const randomChannel = channels.random();
        return randomChannel;
    }

    /**
    * Backend function to create a new match of the selected game type with the provided paramaters.
    */
    async createMatch(gameMode, channel) {
        if (channel === null) {
            const randomChannel = await this.pickRandomChannel();
            channel = randomChannel;
        }

        switch (gameMode) {
            case 'word_scramble':
                const wordScramble = new WordScramble(null, this, channel);
                setTimeout(async () => await wordScramble.beginChallenge(), 2000);
            break;
        }
    }
    


}
module.exports.ChatGameManager = ChatGameManager;
module.exports.GuildChatGameManager = GuildChatGameManager;