class CacheManager {
  _cache;
  _holds;
  _handler;
  _updateDB;

  constructor(holds, callback = null) {
    this._holds = holds;
    this._cache = new Map();

    this._updateDB = typeof callback === "function" ? callback : null;

    this._handler = {
      get: (target, key) => {
        // if (key === "properties") {
        //   return new Proxy(target["properties"], {
        //     get: (props, name) => {
        //       return props[name];
        //     },
        //     set: (props, name, value) => {
        //       props[name] = value;
        //       target["properties"] = props;
        //       return true;
        //     },
        //   });
        // }
        if (
          typeof target[key] === "object" &&
          target[key] !== null &&
          !(target[key] instanceof Map) &&
          !(target[key] instanceof Date)
        ) {
          const proxy = new Proxy(target[key], this._handler);
          if (typeof target[key]["toJSON"] === "function") {
            proxy.toJSON = target[key]["toJSON"].bind(target[key]);
          }

          return proxy;
        }

        return target[key];
      },
      set: (target, key, value) => {
        const matchKeys = ["toJSON", "ephemeral"];
        if (matchKeys.includes(key)) {
          return true;
        }
        if (value === undefined || typeof value === "function") return true;

        target[key] = value;

        if (
          (!target.id || typeof target.id !== "string") &&
          (!target.uuid || typeof target.uuid !== "string")
        ) {
          console.log(target);
          throw new Error("Target must have an id.");
        } else {
          this._add(target.id || target.uuid, target);
        }

        return true;
      },
    };
  }

  /**
   * Add a new item to the cache.
   * @param {string} key The key to store the item under.
   * @param {any} value The value to store.
   */
  _add(key, value) {
    if (!(value instanceof this._holds))
      throw new Error(`Value must be a ${this._holds}.`);

    if (this.timeout !== null) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }

    this.timeout = setTimeout(() => {
      if (typeof this._updateDB === "function") this._updateDB(value);
      else value.ephemeral = true;
    }, 500);

    this._cache.set(key, value);
  }

  /**
   * Retireve a Proxy of an item from the cache.
   */
  _fetch(key) {
    if (!this._cache.has(key)) return null;

    const item = this._cache.get(key);
    const proxy = new Proxy(item, this._handler);
    if (typeof item["toJSON"] === "function") {
      proxy.toJSON = item["toJSON"].bind(item);
    }

    return proxy;
  }

  /**
   * Remove an item from the cache.
   */
  _remove(key, { force = false } = {}) {
    const value = this._cache.get(key);

    if (value && typeof value["destory"] === "function" && force)
      value.destory();

    this._cache.delete(key);
  }

  /**
   * Check if an item exists in the cache.
   */
  _has(key) {
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

module.exports.CacheManager = CacheManager;
