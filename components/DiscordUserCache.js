const DiscordUserModel = require('../database/models/DiscordUserModel');


class DiscordUserCache {

    /**
     * The cache of DiscordUsers.
     */
    cache = new Map();

    constructor() {

    }

    registerDiscordUser(discordUser) {
        if (typeof discordUser === 'object') {
            if (typeof discordUser.id === 'string') {
                this.cache.set(discordUser.id, discordUser);
                return console.log('DiscordUser registered successfully.');
            }
            return console.warn('You passed an invalid DiscordUser to register.');
        }
        return console.warn('You passed an invalid DiscordUser to register.');
    }

    removeDiscordUser(discordUser) {
        if (typeof discordUser === 'object') {
            if (typeof discordUser.id === 'string') {
                this.cache.delete(discordUser.id);
                return console.log('DiscordUser removed successfully.');
            } 
            return console.warn('You passed an invalid DiscordUser to remove.');
            
        } else if (typeof discordUser === 'string') {
            this.cache.delete(discordUser);
            return console.log('DiscordUser removed successfully.');
        } 
        return console.warn('You passed an invalid DiscordUser to remove.');
    }

    getDiscordUser(discordUserId) {
        if (typeof discordUserId === 'string') {
            if (this.cache.has(discordUserId)) {
                return this.cache.get(discordUserId);
            }
            console.warn('That DiscordUser does not exist in the cache.');
            return false 
        }
        console.warn('You passed an invalid DiscordUserId to get.');
        return false 
    }

    syncDatabase() {
        for (let user of this.cache.values()) {
            DiscordUserModel.findOneAndUpdate({ id: user.id }, user, { upsert: true }).catch(err => console.warn(err));
        }
        console.log(this.cache.size + ' DiscordUsers synced to the database.');
        return console.log('DiscordUser cache synced with database.');
    }

}

module.exports = DiscordUserCache;