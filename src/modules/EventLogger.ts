import { MongoClient } from "mongodb";
import clientPromise from "../database/index";
import Discord from "discord.js";
import { OverlordClient } from "../types/Overlord";

/**
 * Log events to the overlord-on-next database.
 */
export class EventLogger {
  client: OverlordClient;

  /**
   * The current status of the EventLogger.
   */
  status: string;

  /**
   * A prepared instance of the MongoDB client.
   */
  #mongoClient: MongoClient | undefined;

  constructor(client: OverlordClient) {
    this.status = "initializing";
    this.client = client;

    this.#init();
  }

  #init() {
    clientPromise
      .then((client) => {
        this.#mongoClient = client;
        this.status = "ready";
      })
      .catch((error) => {
        console.error(error);
        this.status = "error";
      });
  }

  /**
   * Publishes an event to the overlord-on-next database.
   * @param event The event to publish as a JSON string.
   */
  log(event: string) {
    if (this.status !== "ready" || !this.#mongoClient)
      throw new Error("EventLogger is not ready.");

    const jsonEvent = JSON.parse(event);

    const dbLogs = this.#mongoClient.db().collection("logs");
    dbLogs.insertOne(jsonEvent);
  }

  checkStatus() {
    return this.status;
  }
}

/**
 * An event to be logged by the EventLogger.
 * @see EventLogger
 */
export class OverlordLogEvent {
  client: OverlordClient;

  /**
   * The event type.
   */
  type?: string;

  /**
   * A description of the event.
   */
  description?: string;

  /**
   * The guild id of the guild this event is associated with.
   */
  associatedGuildId?: string;

  /**
   * Results caused by the event if applicable.
   */
  results?: any;

  /**
   * Context for the event if applicable.
   */
  context: any;

  /**
   * Timestamps that pertain to the event.
   */
  timestamps: any;

  constructor(client: OverlordClient) {
    this.client = client;
    this.timestamps = {
      createdAt: new Date(),
    };
    return this;
  }

  /**
   * Set the event type.
   * @param {String} type The type of event.
   */
  setType(type: string) {
    if (typeof type != "string") throw new Error("Type must be a string.");
    this.type = type;
    this.#addTimestamp("setType");
    return this;
  }

  /**
   * Set the event desription.
   * @param {String} description The description of the event.
   */
  setDescription(description: string) {
    if (typeof description != "string")
      throw new Error("Description must be a string.");
    this.description = description;
    this.#addTimestamp("setDescription");
    return this;
  }

  /**
   * Associate this event with a specific guild.
   * @param guild The guild to associate the event with.
   */
  setAssociatedGuild(id: string) {
    this.associatedGuildId = id;
    return this;
  }

  /**
   * Attach a piece of context to the event.
   * @param context The context you want to attach.
   *
   */
  attachContext(context: { id: string; item: any }) {
    if (typeof context !== "object")
      throw new Error("Context must be an object.");
    if (!context.id || this.context[context.id])
      throw new Error("Context must have a unique identifer as id.");

    this.context[context.id] = context.item;
    this.#addTimestamp(`attachContext:${context.id}`);
    return this;
  }

  /**
   * Remove a piece of context from the event.
   * @param id The unique identifier of the context to remove.
   */
  removeContext(id: string) {
    if (!this.context.has(id))
      throw new Error(`Context with unique identifier ${id} does not exist.`);
    delete this.context[id];
    this.#addTimestamp(`removeContext:${id}`);
    return this;
  }

  /**
   * Add a timestamp to the events timestamp object with a given name.
   * @param name The property name of the timestamp.
   * @param date The date to be added if it is not the current Date().
   *
   * @return The events timestamp object.
   */
  #addTimestamp(name: string, date?: Date): object {
    if (this.timestamps.hasOwnProperty(name) && !name.includes("recent"))
      return new Error(
        `Timestamp with name ${name} already exists for this event.`
      );
    if (!date) date = new Date();
    if (Date.now() - date.getTime() < -1000)
      return new Error(
        "You cannot add a timestamp more than one second in the future."
      );
    if (Date.now() - date.getTime() > 1000)
      console.log(
        `Warning: Timestamp ${name} is being registered more than one second in the past.`
      );

    this.timestamps[name] = date;
    return this.timestamps;
  }

  /**
   * Logs the event to the database.
   */
  submit() {
    if (this.type === undefined && this.description === undefined)
      throw new Error("Event must have a type and description.");
    if (this.type == undefined) throw new Error("Event type must be defined.");
    if (this.description == undefined)
      throw new Error("Event description must be defined.");

    const logger = this.client.EventLogger;
    logger.log(this.toJSON());

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
      timestamps: this.timestamps,
    });
  }
}
