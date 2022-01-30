const Discord = require('discord.js');
const UserGlobalStats = require('./UserGlobalStats');
const ModerationManager = require('./ModerationManager');
const DataRecord = require('./DataRecord');

const DiscordUserModel = require('../database/models/DiscordUserModel');

/**
 * Base class to interact with and log discord users.
 */
class DiscordUser extends DataRecord {
    /**
     * Discord Id.
     * @type {String}
     */
    id;

    /**
     * Discord username.
     * @type {String}
     */
    username;

    /**
     * Discord discriminator value.
     * @type {String}
     */
    discriminator;

    /**
     * Global stats.
     * @type {UserGlobalStats}
     */
    userStats;

    /**
     * Moderation manager.
     * @type {ModerationManager}
     */
    moderation;

    /**
     * Timestamps for actions on this user.
     * @type {DiscordUserTimestamps}
     */
    timestamps;

    /**
     * Signifies if this user was from a database sync.
     * @type {Boolean}
     */
    fromDatabase = false;

    /**
     * 
     * @param {Discord.User | DatabaseEntry} user The discord user to create a DiscordUser object for.
     */
    constructor(user) {
        super();
        this.id = user.id;
        this.username = user.username;
        this.discriminator = user.discriminator;
        this.fromDatabase = user.fromDatabase ? true : false;

        this.populateDiscordUser(user);
    }

    /**
     * Populate this user with data from the database.
     * @param {DiscordUserModel} user The user to populate.
     */
    populateDiscordUser(user) {
        if (user.fromDatabase) {
            this.setTimestamps(user.timestamps);
            this.userStats = user.userStats;
            this.moderation = user.moderation;
            this.post(true)
        } else {
            this.userStats = new UserGlobalStats();
            this.moderation = new ModerationManager();
            this.timestamps = {
                createdAt: this.createdAt,
                updatedAt: this.updatedAt,
                databaseHitAt: this.databaseHitAt
            }
        }
        this.emit('populated', this);
        return true;
    }

    /**
     * Post this user to the MongoDB.
     * @param {Boolean} timestampUpdate Whether this DB hit is to update the timestamps only.
     */
    async post(timeStampUpdate = false) {
        this.registerDatabaseHit();

        const formattedPost = {
            id: this.id,
            username: this.username,
            discriminator: this.discriminator,
            userStats: this.userStats,
            moderation: this.moderation,
            timestamps: {
                createdAt: this.createdAt,
                updatedAt: this.updatedAt,
                databaseHitAt: this.databaseHitAt
            }
        }

        await DiscordUserModel.findOneAndUpdate({"id": this.id}, formattedPost, {upsert: true}).catch(err => {
            console.log('Error while posting user to database: ' + err);
            this.revokeDatabaseHit();
        })

        this.emit('posted', this);
        if (timeStampUpdate) return;
        global.MongoDiscordUserCache.state = 'UNSYNCED';
    }
}

module.exports = DiscordUser;