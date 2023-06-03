export class ObjectManager {
  _cache;
  _holds;
  _handler?: Function;
  _updateDB;
  timeout: any;

  constructor(holds: any, callback?: Function) {
    this._holds = holds;
    this._cache = new Map();

    this._updateDB = typeof callback === "function" ? callback : null;
  }

  /**
   * Add a new item to the cache.
   * @param key The key to store the item under.
   * @param value The value to store.
   */
  _add(key: string, value: any, options = { cache: false }): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!(value instanceof this._holds))
        return reject(new Error(`Value must be a ${this._holds}.`));

      if (typeof value["toJSON"] !== "function")
        return reject(new Error("Value must have a toJSON method."));

      if (this.timeout !== null) {
        clearTimeout(this.timeout);
        this.timeout = null;
      }

      this.timeout = setTimeout(() => {
        if (typeof this._updateDB === "function" && options.cache === false)
          this._updateDB(value.toJSON());
      }, 500);

      this._cache.set(key, value);
      return resolve(this._fetch(key));
    });
  }

  /**
   * Retireve a Proxy of an item from the cache.
   */
  _fetch(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this._cache.has(key))
        return reject(
          new Error("The key provided could not be found in the cache.")
        );

      const item = this._cache.get(key);
      const instance = new ObjectInstance(this, item);

      if (!instance._proxy || instance._proxy === null)
        return reject(new Error("The ObjectInstance could not be fetched."));

      return resolve(instance._proxy);
    });
  }

  /**
   * Remove an item from the cache.
   */
  _remove(key: string, { force = false } = {}) {
    const value = this._cache.get(key);

    if (value && typeof value["destory"] === "function" && force)
      value.destory();

    this._cache.delete(key);
  }

  /**
   * Check if an item exists in the cache.
   */
  _has(key: string) {
    return this._cache.has(key);
  }

  /**
   * Get the size of the cache depending on provided options.
   */
  _size(callback = () => true) {
    if (typeof callback !== "function")
      throw new Error("Callback must be a function.");

    return [...this._cache.values()].filter(callback).length;
  }
}

class ObjectInstance {
  _manager: ObjectManager;
  _main: any;
  _handler: any;
  _proxy: any;

  constructor(manager: ObjectManager, object: any) {
    if (!(object instanceof manager._holds))
      throw new Error(`Value must be a ${manager._holds}.`);

    this._manager = manager;
    this._main = object;

    this._handler = {
      get: (target: any, key: string) => {
        if (
          typeof target[key] === "object" &&
          target[key] !== null &&
          !(target[key] instanceof Map) &&
          !(target[key] instanceof Date)
        ) {
          const proxy = new Proxy(target[key], this._handler);

          return proxy;
        }

        return target[key];
      },
      set: (target: any, key: string, value: any) => {
        if (typeof value === undefined)
          throw new Error("Cannot set value to undefined.");

        target[key] = value;

        this._manager._add(this._main.id, this._main);

        return true;
      },
    };

    this._proxy = new Proxy(object, this._handler);
  }
}
