const clientPromise = require("./index");
const Discord = require("discord.js");

/**
 * Log events to the overlord-on-next database.
 */
class EventLogger {

    /**
     * The current status of the EventLogger.
     * @type {String}
     */
    status;

    /**
     * A prepared instance of the MongoDB client.
     */
    #mongoClient;

    constructor(client) {

        this.status = "initializing";
        this.client = client;

        this.#init();
    }

    #init() {

        clientPromise.then(client => {
            this.#mongoClient = client;
            this.status = "ready";
        })
        .catch(error => {
            console.error(error);
            this.status = "error";
        });

    }

    /**
     * Publishes an event to the overlord-on-next database.
     * @param { String } event The event to publish as a JSON string.
     */
    log(event, options = null) {

        if (this.status !== "ready") throw new Error("EventLogger is not ready.");

        const jsonEvent = JSON.parse(event).catch(err => {throw err});

        const dbLogs = this.#mongoClient.db().collection('logs')
        dbLogs.insertOne(jsonEvent, (err, result) => {
            if (err) {
                console.error(err);
            }
            else {
                console.log(result);
            }
        })
        
    }

    checkStatus() {
        return this.status;
    }

}

/**
 * An event to be logged by the EventLogger.
 * @see EventLogger
 */
class OverlordEvent {

    /**
     * The event type.
     * @type {String}
     */
    type;

    /**
     * A description of the event.
     * @type {String}
     */
    description;

    /**
     * The guild id of the guild this event is associated with.
     */
    associatedGuildId;

    /**
     * Results caused by the event if applicable.
     */
    results;

    /**
     * Context for the event if applicable.
     */
    context = {};

    /**
     * Timestamps that pertain to the event.
     */
    timestamps = {};

    constructor(client) {
        this.client = client;
        this.timestamps = {
            createdAt: new Date()
        };
        return this
    }
    
    /**
     * Set the event type.
     * @param {String} type The type of event.
     */
    setType(type) {
        if (typeof type !== "string") throw new Error("Type must be a string.");
        this.type = type;
        this.#addTimestamp('setType');
        return this;
    }

    /**
     * Set the event desription.
     * @param {String} description The description of the event.
     */
    setDescription(description) {
        if (typeof description !== "string") throw new Error("Description must be a string.");
        this.description = description;
        this.#addTimestamp('setDescription');
        return this;
    }

    /**
     * Associate this event with a specific guild.
     * @param { String | Discord.Guild } guild The guild to associate the event with.
     */
    setAssociatedGuild(id) {
        this.associatedGuildId = id;
        return this;
    }

    /**
     * Attach a piece of context to the event.
     * @param {Object} context The context you want to attach.
     * @param {String} context.id The unique identifer for the context.
     * @param {any} context.item The context item or value.
     * 
     */
    attachContext(context) {
        if (typeof context !== "object") throw new Error("Context must be an object.");
        if (!context.id || this.context[context.id]) throw new Error("Context must have a unique identifer as id.");

        this.context[context.id] = context.item;
        this.#addTimestamp(`attachContext:${context.id}`);
        return this;
    }

    /**
     * Remove a piece of context from the event.
     * @param {String} id The unique identifier of the context to remove.
     */
    removeContext(id) {
        if (!this.context.has(id)) throw new Error(`Context with unique identifier ${id} does not exist.`);
        delete this.context[id];
        this.#addTimestamp(`removeContext:${context.id}`);
        return this;
    }

    /**
     * Add a timestamp to the events timestamp object with a given name.
     * @param {String} name The property name of the timestamp.
     * @param {Date} date The date to be added if it is not the current Date().
     * 
     * @return {Object} The events timestamp object.
     */
    #addTimestamp(name, date = undefined) {
        if (this.timestamps.hasOwnProperty(name) && !name.includes('recent')) return new Error(`Timestamp with name ${name} already exists for this event.`);
        if (!date) date = new Date();
        if (Date.now() - date.getTime() < -1000) return new Error("You cannot add a timestamp more than one second in the future.");
        if (Date.now() - date.getTime() > 1000) console.log(`Warning: Timestamp ${name} is being registered more than one second in the past.`);

        this.timestamps[name] = date;
        return this.timestamps;
    }
    
    /**
     * Logs the event to the database.
     */
    submit(options = null) {

        if (this.type === undefined && this.description === undefined) throw new Error("Event must have a type and description.");
        if (this.type == undefined) throw new Error("Event type must be defined.");
        if (this.description == undefined) throw new Error("Event description must be defined.");

        const logger = this.client.EventLogger;
        logger.log(this.toJSON(), options);

        return this;
    }

    /**
     * Convert the OverlordEvent to a mongo friendly JSON object.
     */
    toJSON() {
        
        return JSON.stringify({
            type: this.type,
            description: this.description,
            associatedGuildId: this.associatedGuildId,
            results: this.results,
            context: this.context,
            timestamps: this.timestamps
        });
    }
}

module.exports.EventLogger = EventLogger;
module.exports.OverlordEvent = OverlordEvent;