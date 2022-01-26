const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');


/**
 * A manager class that handles creating and managing application instances
 * @extends EventEmitter
 */
class InstanceManager extends EventEmitter {
    #instances;
    constructor(client) {
        super();
        this.client = client;
        this.#instances = new Map();
    }

    /**
     * Cache the provided instance, giving it a UUID if it doesn't already have one.
     * @param {Object} instance - The instance object to cache.
     * @returns {CacheRecord} The id of the instance.
     */
    cacheInstance(instance) {
        if (typeof instance != 'object') return 'You passed an invalid instance to be cached.';

        if (typeof instance.id === 'undefined') {
            const id = uuidv4();
            instance.id = id;
            this.#instances.set(id, instance);
            return {
                id: id,
                cachedInstance: instance,
                message: `Instance cached successfully with id ${id}.`
            }
        } 
        else if (typeof instance.id === 'string') {
            const id = instance.id;
            this.#instances.set(id, instance);
            return {
                id: id,
                cachedInstance: instance,
                message: `Instance recached successfully with id ${id}.`
            }
        }
    }

    /**
     * Remove the provided instance from the cache.
     * @param {*} instance - The instance signified by the id, or the instance object.
     * @returns {Boolean} Whether or not the instance was removed from the cache.
     */
    removeCachedInstance(instance) {
        if (typeof instance === 'string') {
            this.#instances.delete(instance);
            return true;
        }
        else if (typeof instance === 'object') {
            this.#instances.delete(instance.id);
            return true;
        }
        else {
            return false;
        }
    }

    /**
     * Get an instance object from the cache.
     * @param {String | object} instance - The instance signified by the id, or the instance object.
     * @returns {Object} The instance object, or null if it wasn't found.
     */
    getCachedInstance(instance) {
        if (typeof instance != 'object' || 'string') return null;
        if (typeof instance === 'string') {
            return this.#instances.get(instance);
        }
        if (typeof instance === 'object') {
            return this.#instances.get(instance.id);
        }

    }

}

module.exports = InstanceManager;