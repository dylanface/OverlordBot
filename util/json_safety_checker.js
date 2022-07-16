
/**
 * Given a desired JSON format and a JSON object, inspect the object and compare it to the desired format.
 * If the object is not in the desired format or a similar safe format, throw an error.
 * @param {Object} format The desired JSON format.
 * @param {Object} inspect The JSON object to inspect against the desired format.
 * @param {KeyTracker} tracker A KeyTracker object to track optional keys and missed keys.
 * @param {Array} parentKeys For internal function use when recursively checking the JSON object.
 */
function compareJSON(format, inspect, tracker, parentKeys = []) {

    for (let key in format) {
        if (format[key] instanceof Object) {
            compareJSON(format[key], inspect[key], tracker, [...parentKeys, key]);
        }
        else if (inspect[key] === undefined) {
            const fullKey = [...parentKeys, key].join('.');
            if (!tracker.missingKeys.includes(fullKey)) tracker.missingKey(fullKey);
        }
    }

    for (let key in inspect) {
        if (inspect[key] instanceof Object) {
            compareJSON(format[key], inspect[key], tracker, [...parentKeys, key]);
        }
        else if (format[key] === undefined) {
            const fullKey = [...parentKeys, key].join('.');
            if (!tracker.missingKeys.includes(fullKey)) tracker.missingKey(fullKey);
        }
    }

    return;
}

function strictCheckJSON(format, json) {
    const keyTracker = new KeyTracker();

    compareJSON(format, json, keyTracker);

    console.log(keyTracker.isSafe());
    console.log(keyTracker.missingKeys);

}

function forgivingCheckJSON(format, json, optionalKeys = []) {
    const keyTracker = new KeyTracker(optionalKeys);

    compareJSON(format, json, keyTracker);

    console.log(keyTracker.isSafe());
    console.log(keyTracker.keys)
}


class KeyTracker {

    #keyCount = 0;

    optionalKeys = [];
    missingKeys = [];
    repeatKeys = [];

    constructor(optionalKeys = []) {
        this.optionalKeys = optionalKeys;
    }

    get keys() {
        return this.#keyCount;
    }

    missingKey(fullKey) {
        this.missingKeys.push(fullKey);
        this.#keyCount++;
    }

    isSafe() {
        if (this.missingKeys.length > 0) {
            for (let key of this.missingKeys) {
                if (!this.optionalKeys.includes(key)) {
                    return false;
                }
            }
            return true;
        } else return this.#keyCount === 0;
    }

}


const format1 = {
  editLogs: {
    enabled: false,
    web: false,
    channelId: null,
    regex: {
      enabled: false,
      ignorePatterns: [],
      forcePatterns: [],
    },
    messageDiff: {
      enabled: false,
      characters: 3,
    },
    reactions: {
      enabled: false,
      overlordEmoji: false,
      ignoreEmoji: [],
      forceEmoji: [],
    },
  },
  moderationLogs: {
    enabled: true,
    web: false,
    channelId: null,
    seperateActions: false,
  },
};

const format2 = {
  editLogs: {
    disabled: false,
    enabled: false,
    web: false,
    channelId: null,
    regex: {
      ignorePatterns: [],
      forcePatterns: [],
    },
    messageDiff: {
      enabled: false,
      characters: 3,
    },
    reactions: {
      enabled: false,
      overlordEmoji: false,
      ignoreEmoji: [],
      forceEmoji: [],
    },
  },
  moderationLogs: {
    enabled: true,
    web: false,
    channelId: null,
    seperateActions: false,
  },
};


strictCheckJSON(format1, format2);
forgivingCheckJSON(format1, format2, ['editLogs.regex.enabled']);





 
module.exports.compareJSON = compareJSON;