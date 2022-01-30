const DiscordUserModel = require('../../database/models/DiscordUserModel');
const DiscordUser = require('../../components/DiscordUser');


/**
 * The watcher for the discord_user database collection.
 */
class DatabaseWatcher {

    /**
     * Local cache of DiscordUser objects.
     * @type {Map<String, DiscordUser>}
     */
    cache = new Map();

    /**
     * State of the watcher.
     * @type {DatabaseWatcherState}
     */
    state = 'STARTUP';


    constructor() {
        this.init();
    }

    /**
     * Fetch DiscordUser objects from the database.
     * @param {Number} limit - The limit of users to fetch.
     */
    async #fetch(limit = 100) {
        const userArray = await DiscordUserModel.find({}, null, { limit: limit }).exec();
        return userArray;
    }

    /**
     * Execute the fetch function and update the cache.
     * 
     */
    async updateCache() {
        const users = await this.#fetch();
        for (const user of users) {
            user.fromDatabase = true;
            this.cache.set(user.id, {
                mongo_id: user._id,
                DiscordUser: new DiscordUser(user)
            });
        }
        this.state = 'SYNCED';
    }


    init() {
        this.state = 'UNTOUCHED';

        setInterval(async () => {
            if (this.state === 'SYNCED') return;
            if (this.state === 'UNSYNCED' || 'UNTOUCHED') {
                await this.updateCache();
                console.log('DatabaseWatcher: Updated cache');
            }
        }, 1000)
    }

    
}

module.exports.DatabaseWatcher = DatabaseWatcher;
