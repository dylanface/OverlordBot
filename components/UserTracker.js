const Discord = require('discord.js');
const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');
const clientPromise = require('../database');

class TrackerController {

    /**
     * Discord client this TrackerController is attached to.
     * @type { Discord.Client }
     */
    client;

    /**
     * This controllers cache of UserTrackers.
     */
    #cache;

    constructor(client) {
        this.client = client;
        this.#cache = new Map();
    }

    get cache() {
        return this.#cache;
    }
    
    /**
     * Create a new user tracker for a valid user.
     * 
     * @returns {Promise<UserTracker>} The newly created user tracker.
     */
    createTracker(user) {
        return new Promise((resolve, reject) => {
            const tracker = new UserTracker(user, this);

            const timeout = setTimeout(() => {
                tracker.setStatus(3);
                reject(new Error('Tracker creation timed out.'));
                tracker.removeAllListeners('staged');
            }, 10 * 1000)

            tracker.once('staged', (tracker) => {
                clearTimeout(timeout);
                resolve(this._add(tracker.id, tracker));
                console.log('Tracker created.');
            })

            tracker.once('healthy', (tracker) => {
                console.log('Tracker is healthy.');
            })
        })
    }

    /**
     * Remove a user tracker from the cache by Discord.User id or UserTracker id.
     * @param {String} id The id string to search for when attempting to assign the tracker to cleanup.
     */
    removeTracker(id) {
        if (typeof id !== 'string') throw new Error('Tracker ID must be a string.');

        var tracker = this.#cache.get(id);
        if (!tracker) {
            var tracker = this.#cache.find((tracker) => tracker.userId === id);
            if (!tracker) throw new Error('Tracker not found.');
        }

        tracker.setStatus(3);
    }

    /**
     * Add a user tracker to the cache.
     * @param {String} id The UserTracker id of the UserTracker to add to the cache.
     * @param {UserTracker} tracker The UserTracker to add to the cache.
     */
    _add(id, tracker) {
        if (typeof id !== 'string') throw new Error('Tracker ID must be a string.');
        if (!(tracker instanceof UserTracker)) throw new Error('Tracker must be an instance of UserTracker.');

        this.#cache.set(id, tracker);

        return tracker;
    }

    /**
     * Save the entire cache of UserTrackers to the database.
     * @param {any} [options] Options to pass to the database.
     * 
     * @returns {Promise<any>}
     */
    backup(options = null) {
        return new Promise(async (resolve, reject) => {
            const savedTrackers = [];

            for (const [id, tracker] of this.#cache) {
                await this.edit(tracker).then(() => savedTrackers.push(id)).catch(reject);
            }

            resolve({
                success: true,
                trackers: savedTrackers
            });

        });
    }

    /**
     * Attempt to edit an existing UserTracker or upsert a new one into the database.
     * @param {UserTracker} tracker The UserTracker to edit or upsert.
     */
    edit(tracker) {
        return new Promise((resolve, reject) => {
            if (!(tracker instanceof UserTracker)) throw new Error('Tracker must be an instance of UserTracker.');

            const { mongoId } = tracker.databaseInfo;

            clientPromise.then((client) => {
                const trackerCollection = client.db().collection('l_user_trackers');

                trackerCollection.updateOne({ _id: mongoId }, { $set: tracker.toJSON() }, { upsert: true }, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        tracker.databaseInfo.mongoId = result.insertedId.toString();
                        resolve(result)
                    }
                })
            })
            
        });
    }

    /**
     * Pull UserTrackers from the database, check if they are outdated and add updated or new UserTrackers to the cache.
     */
    hydrate(options = null) {
        return new Promise((resolve, reject) => {




        });
    }

}

class UserTracker extends EventEmitter {

    /**
     * The controller that created this UserTracker.
     * @type {TrackerController}
     */
    controller;

    id;

    user;

    userId;

    status;

    databaseInfo = {
        mongoId: undefined,
    };

    timestamps = {};
    
    constructor(user, controller) {
        super();
        this.controller = controller;
        console.log('Creating new UserTracker.');

        this.setStatus(2);
        this.#generateTrackerId();

        setTimeout(() => {
          this.#initialUserLoad(user);
        }, 1000);

    }


    #initialUserLoad(user) {
        if (typeof user === 'string') {
            console.log('User is a string, fetching user.');
            const result = this.#getUser(user, this.controller.client);
            if (!result) throw new Error("User not found. Tracker will be destroyed.");
            else {
                this.user = result
                this.userId = result.id;
                this.emit('staged', this);
                this.setStatus(1);
            };
        }
        else if (user instanceof Discord.User) {
            console.log("User is a user.");
            this.user = user;
            this.userId = user.id;
            this.emit('staged', this);
            this.setStatus(1);
        } else {
            this.setStatus(3);
            throw new Error("User must be of type Discord.User or a stringified Snowflake Id. Tracker will be destroyed.");
        }
    }

    /**
     * Fetch the User object from Discord if a User object is not provided on construction.
     * @param { String } userId The user id to fetch.
     * @param { Discord.Client } client The client to use to fetch the user.
     */
    async #getUser(userId, client) {

        if (!client) throw new Error("Client was not passed by the TrackerController, check service health.");
        if (typeof userId !== 'string') throw new Error("userId must be a string.");
        const result = await client.users.fetch(userId);

        if (!result) return undefined;
        
        return result;

    }

    /**
     * Generate and assign an id to this tracker.
     */
    #generateTrackerId() {

        this.id = uuidv4();
        this.#addTimestamp('assignId');

        console.log(`Tracker id is ${this.id}`);

    }

    /**
     * Set the status of the tracker based on status code passed in.
     * @param { 0 | 1 | 2 | 3 | 4 } code The status code to apply to this UserTracker.
     * 
     * 0 (error): Error has occured within the UserTracker and will attempt recovery on the next sweep, if recovery fails automatically mark for cleanup.
     * 
     * 1 (healthy): UserTracker has been staged and is running as intended with no unrecoverable errors.
     * 
     * 2 (c-staging): The TrackerController is still staging the UserTracker, the UserTracker is not subject to sweeps or input at this point and error is fatal.
     * 
     * 3 (cleanup): The UserTracker is marked for cleanup and will be removed from the cache and archived [if applicable] on the next sweep.
     * 
     * 4 (unhealthy): The UserTracker is in an unhealthy or outdated state and will be updated on the next sweep.
     */
    setStatus(code) {
        if (typeof code !== 'number') throw new Error("Status code must be of type number.");

        switch(code) {
            case 0:
                this.status = {code: 0, message: "error"};
                this.#addTimestamp('recentSetStatus');
                this.emit('error', this);
                break;

            case 1:
                this.status = {code: 1, message: "healthy"};
                this.#addTimestamp('recentSetStatus');
                this.emit('healthy', this);
                break;

            case 2:
                this.status = {code: 2, message: "controller-staging"};
                this.#addTimestamp('recentSetStatus');
                this.emit('c-staging', this);
                break;

            case 3:
                this.status = {code: 3, message: "cleanup"};
                this.#addTimestamp('recentSetStatus');
                this.emit('mark_for_cleanup', this);
                break;

            case 4:
                this.status = {code: 4, message: "unhealthy"};
                this.#addTimestamp('recentSetStatus');
                this.emit('unhealthy', this);
                break;

            default:
                throw new Error("Status code must be between 0 and 4.");
        }

    }

    /**
     * Add a timestamp to the UserTrackers timestamp object with a given name.
     * @param {String} name The property name of the timestamp.
     * @param {Date} date The date to be added if it is not the current Date().
     * 
     * @return {Object} The UserTrackers timestamp object.
     */
     #addTimestamp(name, date = undefined) {
        if (this.timestamps.hasOwnProperty(name) && !name.includes('recent')) throw new Error(`Timestamp with name ${name} already exists for this UserTracker.`);
        if (!date) date = new Date();
        if (Date.now() - date.getTime() < -1000) throw new Error("You cannot add a timestamp more than one second in the future.");
        if (Date.now() - date.getTime() > 1000) console.log(`Warning: Timestamp ${name} is being registered more than one second in the past.`);

        this.timestamps[name] = date;
        return this.timestamps;
    }




    toJSON() {
        return {
            id: this.id,
            userId: this.userId,
            user: this.user,
            status: this.status,
            timestamps: this.timestamps,
            guilds: this.trackedInGuilds,
            databaseInfo: this.databaseInfo,
            storage: this.StorageManager.toJSON()
        }
    }
    

}

class UserWatcher {

    

}

module.exports.TrackerController = TrackerController;
module.exports.UserTracker = UserTracker;