const clientPromise = require("../database/index");
const { CacheManager } = require("../templates/CacheManager");

class GuildSettingsManager extends CacheManager {
  #cache;

  ready = false;

  constructor() {
    super(GuildSettings, (settings) => {
      console.log("GuildSettingsManager callback called.");
    });

    this.#init();
  }

  /**
   * Fetch existing settings for guilds from mongodb and set ready state to true on success.
   */
  #init() {
    clientPromise
      .then(async (client) => {
        const settingsCol = client.db().collection("guild_settings");
        const allFetchedSettings = await settingsCol.find({}).toArray();

        for (let guildSetting of allFetchedSettings) {
          const settingsForStorage = new GuildSettings(
            guildSetting.guildId,
            guildSetting.settings
          );
          this._add(guildSetting.guildId, settingsForStorage);
          console.log(this._cache);
        }
      })
      .catch((error) => {
        console.error(error);
        return;
      });

    this.ready = true;
    console.log(`GuildSettingsManager ready state: ${this.ready}`);
  }

  /**
   * Returns a GuildSettings object for the given guildId from the cache.
   */
  getAllGuildSettings(guildId) {
    return this.#cache.get(guildId);
  }

  /**
   * Returns the value of the specified setting from the GuildSettings object for the given guildId.
   */
  getGuildSetting(guildId, setting) {
    const guildSettings = this.#cache.get(guildId);
    return guildSettings.getSetting(setting);
  }

  /**
   * Update the GuildSettings object for the given guildId with the given settings in safe JSON from the web panel.
   */
  updateGuildSettings(guildId, settings) {
    const guildSettings = this.#cache.get(guildId);

    guildSettings.setFromJSON(settings);
  }

  /**
   *
   * @param {string} guildId The snowflake of the guild to remove settings for.
   * @param {GuildSettings} settings The GuildSettings object to update in the DB.
   */
  updateGuildSettingsDB(guildId, settings) {
    let result = undefined;
    clientPromise.then((client) => {
      const settingsCol = client.db().collection("guild_settings");

      result = settingsCol.updateOne(
        { guildId: guildId },
        { $set: settings.toJSON() }
      );
    });
    if (result === undefined)
      throw new Error("GuildSettings could not be saved.");
    else console.log("GuildSettings saved.");
  }

  /**
   * Add a new GuildSettings object to the cache for the given guildId.
   * @param {string} guildId The snowflake of the guild to add default settings for.
   */
  addGuildSettings(guildId) {
    const guildSettings = new GuildSettings(guildId);
    this._add(guildId, guildSettings);
    return this._fetch(guildId);
  }
}

class GuildSettings {
  editLogs;
  moderationLogs;

  constructor(guildId, existingSettings = undefined) {
    this.guildId = guildId;
    if (existingSettings) {
      if (existingSettings.editLogs) {
        this.editLogs = new EditLogSettings(existingSettings.editLogs);
      } else {
        this.editLogs = new EditLogSettings();
      }
      if (existingSettings.moderationLogs) {
        this.moderationLogs = new ModerationLogSettings(
          existingSettings.moderationLogs
        );
      } else {
        this.moderationLogs = new ModerationLogSettings();
      }
    } else {
      this.editLogs = new EditLogSettings();
      this._moderationLogs = new ModerationLogSettings();
    }
  }

  /**
   * Returns the value of the specified setting from the GuildSettings object.
   * @param {string} setting
   */
  getSetting(setting) {}

  // toggleEditLogs(force = undefined) {
  //   this._settings.editLogs.enabled =
  //     force === undefined ? !this._settings.editLogs.enabled : force;
  // }

  // editLogsSetChannel(channelId) {
  //   if (typeof channelId === "string")
  //     this._settings.editLogs.channelId = channelId;
  //   else throw new Error("Channel ID must be a string.");
  // }

  // toggleEditLogsWebLogging(force = undefined) {
  //   this._settings.editLogs.web =
  //     force === undefined ? !this._settings.editLogs.web : force;
  // }

  // toggleEditLogsMessageRegex(force = undefined) {
  //   this._settings.editLogs.regex.enabled =
  //     force === undefined ? !this._settings.editLogs.regex.enabled : force;
  // }

  // addRegexIgnorePattern(pattern) {
  //   if (typeof pattern === "string")
  //     this._settings.editLogs.regex.ignorePatterns.push(pattern);
  //   else throw new Error("Pattern must be a string.");
  // }

  // addRegexForcePattern(pattern) {
  //   if (typeof pattern === "string")
  //     this._settings.editLogs.regex.forcePatterns.push(pattern);
  //   else throw new Error("Pattern must be a string.");
  // }

  // toggleEditLogsMessageDiff(force = undefined) {
  //   this._settings.editLogs.messageDiff.enabled =
  //     force === undefined
  //       ? !this._settings.editLogs.messageDiff.enabled
  //       : force;
  // }

  // setMessageDiffCharacters(characters) {
  //   if (typeof characters === "number")
  //     this._settings.editLogs.messageDiff.characters = characters;
  //   else throw new Error("Characters must be a number.");
  // }

  // toggleEditLogsReactions(force = undefined) {
  //   this._settings.editLogs.reactions.enabled =
  //     force === undefined ? !this._settings.editLogs.reactions.enabled : force;
  // }

  // toggleEditLogsReactionsOverlordEmoji(force = undefined) {
  //   this._settings.editLogs.reactions.overlordEmoji =
  //     force === undefined
  //       ? !this._settings.editLogs.reactions.overlordEmoji
  //       : force;
  // }

  // toggleModerationLogs(force = undefined) {
  //   this._settings.moderationLogs.enabled =
  //     force === undefined ? !this._settings.moderationLogs.enabled : force;
  // }

  // moderationLogsSetChannel(channelId) {
  //   if (typeof channelId === "string")
  //     this._settings.moderationLogs.channelId = channelId;
  //   else throw new Error("Channel ID must be a string.");
  // }

  // toggleModerationLogsWebLogging(force = undefined) {
  //   this._settings.moderationLogs.web =
  //     force === undefined ? !this._settings.moderationLogs.web : force;
  // }

  // toggleModerationLogsSeperateActions(force = undefined) {
  //   this._settings.moderationLogs.seperateActions =
  //     force === undefined
  //       ? !this._settings.moderationLogs.seperateActions
  //       : force;
  // }

  get toJSON() {
    let json = {};
    json.guildId = this.guildId;
    json.editLogs = this.editLogs.toJSON;
    json.moderationLogs = this.moderationLogs.toJSON;

    return json;
  }
}

class EditLogSettings {
  constructor(template = undefined) {
    if (template !== undefined) {
      this.enabled = template?.enabled;
      this.web = template?.web;
      this.channelId = template?.channelId;
      this.regex = template?.regex;
      this.messageDiff = template?.messageDiff;
      this.reactions = template?.reactions;
    } else {
      this.enabled = false;
      this.web = false;
      this.channelId = null;
      this.regex = {
        enabled: false,
        ignorePatterns: [],
        forcePatterns: [],
      };
      this.messageDiff = {
        enabled: false,
        characters: 3,
      };
      this.reactions = {
        enabled: false,
        overlordEmoji: false,
        ignoreEmoji: [],
        forceEmoji: [],
      };
    }
  }

  toJSON() {
    return {
      enabled: this.enabled,
      web: this.web,
      channelId: this.channelId,
      regex: this.regex,
      messageDiff: this.messageDiff,
      reactions: this.reactions,
    };
  }
}

class ModerationLogSettings {
  constructor(template = undefined) {
    if (template !== undefined) {
      this.enabled = template?.enabled;
      this.web = template?.web;
      this.channelId = template?.channelId;
      this.seperateActions = template?.seperateActions;
    } else {
      this.enabled = true;
      this.web = false;
      this.channelId = null;
      this.seperateActions = false;
    }
  }

  toJSON() {
    return {
      enabled: this.enabled,
      web: this.web,
      channelId: this.channelId,
      seperateActions: this.seperateActions,
    };
  }
}

module.exports.GuildSettingsManager = GuildSettingsManager;
