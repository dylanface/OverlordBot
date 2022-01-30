const EventEmitter = require('events');

class DataRecord extends EventEmitter {

    /**
     * Timestamp for the creating of this record.
     * @type {Date}
     */
    createdAt;

    /**
     * Timestamp for the first time the record hit the database.
     * @type {Date | undefined}
     */
    databaseHitAt = undefined;

    /**
     * Timestamp for the last time the record was updated in the database.
     * @type {Date | undefined}
     */
    updatedAt = undefined;


    constructor() {
        super();
        this.createdAt = new Date();
    }

    /**
     * Update the database timestamps for this record.
     */
    registerDatabaseHit() {
        if (this.databaseHitAt === undefined) {
            this.databaseHitAt = new Date();
            this.updatedAt = this.databaseHitAt;
        } else {
            this.updatedAt = new Date();
        }
        return true;
    }

    revokeDatabaseHit() {
        if (this.databaseHitAt === this.updatedAt) {
            this.databaseHitAt = undefined;
            this.updatedAt = undefined;
            return true;
        }
    }

    /**
     * Forcefully update the database timestamps for this record.
     * @param {Timestamps} timestamps The timestamps to object update with.
     */
    setTimestamps(timestamps) {
        this.createdAt = timestamps.createdAt;
        this.databaseHitAt = timestamps?.databaseHitAt || undefined;
        this.updatedAt = timestamps?.updatedAt || undefined;
    }

}

module.exports = DataRecord;