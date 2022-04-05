const DiscordUserModeration = require('../components/DiscordUserModeration');
const DiscordUserStats = require('../components/DiscordUserStats');


/**
 * The interaction class for a DiscordUser within Overlord.
 */
class DiscordUser {

    /**
     * The Discord id of the DiscordUser.
     * @type {String}
     */
    id;

    /**
     * The Discord username of the DiscordUser.
     * @type {String}
     */
    username;

    /**
     * The Discord discriminator for the DiscordUser.
     * @type {String}
     */
    discriminator;

    /**
     * The stats object for this DiscordUser.
     */
    stats;

    /**
     * The ModerationManager for this DiscordUser.
     * @type {DiscordUserModeration}
     */
    moderation;

    /**
     * 
     */
    constructor(user) {
        this.id = user.id;
        this.username = user.username;
        this.discriminator = user.discriminator;

        this.stats = new DiscordUserStats();
        this.moderation = new DiscordUserModeration();

        this.load();
    }

    load() {
        if (global.DiscordClient.DiscordUserCache.getDiscordUser(this.id)) {
            const dbUser = global.DiscordClient.DiscordUserCache.getDiscordUser(this.id)
            this.id = dbUser.id;
            this.username = dbUser.username;
            this.discriminator = dbUser.discriminator;
            this.stats = dbUser.stats;
            this.moderation = dbUser.moderation;

            console.log(this)
            return console.log('DiscordUser overwritten successfully.');
        }
        console.log(this) 
        return console.log('DiscordUser loaded successfully.'); 
    }

    save() {
        global.DiscordClient.DiscordUserCache.registerDiscordUser(this);
        global.DiscordClient.DiscordUserCache.syncDatabase();
        return console.log('DiscordUser saved successfully.');
    }


}

module.exports = DiscordUser;