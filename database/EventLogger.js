const clientPromise = require("./index");
const botClient = global.DiscordClient;

/**
 * 
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
    mongoClient;

    constructor() {

        this.status = "initializing";

        this.init();
    }

    init() {

        clientPromise.then(client => {
            this.mongoClient = client;
            this.status = "ready";
        })
        .catch(error => {
            console.error(error);
            this.status = "error";
        });

    }

    log(event, options = null) {
        
        if (options) var { upsert } = options;

        if (this.status !== "ready") return new Error("EventLogger is not ready.");
        
        if (!event.guild) {
            this.#parse(event);
        }


    }

    async #parse(event) {
        const { message, options, name } = event;

        const event = new OverlordEvent()
        .setType('error')
        .setDescription(message)
        .attachContext({ id: 'errorType', item: name });

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
    type = undefined;

    /**
     * A description of the event.
     * @type {String}
     */
    description = undefined;

    /**
     * Results caused by the event if applicable.
     */
    results = null;

    /**
     * Context for the event if applicable.
     */
    context = new Map();

    /**
     * Timestamps that pertain to the event.
     */
    timestamps;

    constructor() {
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
        if (typeof type !== "string") return new Error("Type must be a string.");
        this.type = type;
        this.#addTimestamp('setType');
        return this;
    }

    /**
     * Set the event desription.
     * @param {String} description The description of the event.
     */
    setDescription(description) {
        if (typeof description !== "string") return new Error("Description must be a string.");
        this.description = description;
        this.#addTimestamp('setDescription');
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
        if (typeof context !== "object") return new Error("Context must be an object.");
        if (!context.id || this.context.has(context?.id)) return new Error("Context must have a unique identifer as id.");

        this.context.set(context.id, context);
        this.#addTimestamp(`attachContext:${context.id}`);
        return this;
    }

    /**
     * Remove a piece of context from the event.
     * @param {String} id The unique identifier of the context to remove.
     */
    removeContext(id) {
        if (!this.context.has(id)) return new Error(`Context with unique identifier ${id} does not exist.`);
        this.context.delete(id);
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

        if (this.type === undefined && this.description === undefined) return new Error("Event must have a type and description.");
        if (this.type == undefined) return new Error("Event type must be defined.");
        if (this.description == undefined) return new Error("Event description must be defined.");

        const logger = botClient.EventLogger;
        logger.log(this, options);

        return this;
    }
}

module.exports.EventLogger = EventLogger;
module.exports.OverlordEvent = OverlordEvent;