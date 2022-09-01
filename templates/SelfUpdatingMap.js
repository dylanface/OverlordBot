const { Party } = require("../modules/PartyPlanner/Party");
const { UserProfile } = require("../modules/UserProfiles/UserProfile");

class SelfUpdatingMap extends Map {
  handler;

  constructor(...args) {
    super(...args);
    this.handler = {
      get: (target, key) => {
        if (target[key] instanceof Date) return target[key];
        if (typeof target[key] === "object" && target[key] !== null) {
          return new Proxy(target[key], this.handler);
        }

        return target[key];
      },
      set: (target, key, value) => {
        target[key] = value;

        if (target instanceof Party) {
          target.manager.updateParty(target);
        }

        return true;
      },
    };
  }

  set(key, value) {
    console.log("set called");
    return super.set(key, value);
  }

  get(key) {
    const value = super.get(key);
    if (!value) return null;
    else if (typeof value === "object" && value !== null) {
      return new Proxy(value, this.handler);
    }

    return value;
  }
}

module.exports.SelfUpdatingMap = SelfUpdatingMap;
