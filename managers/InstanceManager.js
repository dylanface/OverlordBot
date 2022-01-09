const { v4: uuidv4 } = require('uuid');
const EventEmitter = require('events');

class InstanceManager extends EventEmitter {
    constructor(client) {
        super();
        this.client = client;
        this._instances = new Map();
    }

    cacheInstance(instance) {
        if (typeof instance != 'object') return 'You passed an invalid instance to be cached.';

        if (typeof instance.id === 'undefined') {
            const id = uuidv4();
            instance.id = id;
            this._instances.set(id, instance);
            return {
                id: id,
                cachedInstance: instance,
                message: `Instance cached successfully with id ${id}.`
            }
        } 
        else if (typeof instance.id === 'string') {
            const id = instance.id;
            this._instances.set(id, instance);
            return {
                id: id,
                cachedInstance: instance,
                message: `Instance recached successfully with id ${id}.`
            }
        }
    }

    removeCachedInstance(instance) {
        if (typeof instance === 'string') {
            this._instances.delete(instance);
            return true;
        }
        else if (typeof instance === 'object') {
            this._instances.delete(instance.id);
            return true;
        }
        else {
            return false;
        }
    }

    getCachedInstance(instance) {
        if (typeof instance === 'string') {
            return this._instances.get(instance);
        }
        if (typeof instance === 'object') {
            return this._instances.get(instance.id);
        }

    }

}

module.exports = InstanceManager;