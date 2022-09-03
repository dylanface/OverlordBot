class SelfUpdatingMap extends Map {
  handler;
  updateCallback;

  constructor(updateCallback, ...args) {
    super(...args);
    if (!updateCallback || typeof updateCallback !== "function")
      throw new Error(
        "You must provide a valid update callback when creating a SelfUpdatingMap."
      );
    this.updateCallback = updateCallback;
    this.handler = {
      get: (target, key) => {
        if (target[key] instanceof Date) return target[key];
        if (
          typeof target[key] === "object" &&
          target[key] !== null &&
          !(target[key] instanceof SelfUpdatingMap)
        ) {
          return new Proxy(target[key], this.handler);
        }

        return target[key];
      },
      set: (target, key, value) => {
        target[key] = value;
        target.save();
        return true;
      },
    };
  }

  set(key, value) {
    value.save();
    return super.set(key, value);
  }

  get(key) {
    const value = super.get(key);
    if (!value) return null;
    else if (
      typeof value === "object" &&
      value !== null &&
      !(value instanceof SelfUpdatingMap)
    ) {
      return new Proxy(value, this.handler);
    }

    return value;
  }
}

module.exports.SelfUpdatingMap = SelfUpdatingMap;
