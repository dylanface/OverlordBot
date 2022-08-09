const clientPromise = require("../database/index");

class GuildSettingsManager {

  #cache;

  ready = false;

  constructor() {
    this.#cache = new Map();

    this.#init();
  }

  /**
   * Fetch existing settings for guilds from mongodb and set ready state to true on success.
   */
  #init() {

    clientPromise.then(client => {

        const settingsCol = client.db().collection('guild_settings');
        const allFetchedSettings = settingsCol.find({}).toArray();

        for (let guildSetting of allFetchedSettings) {
            const settingsForStorage = new GuildSettings(guildSetting.guildId, guildSetting.settings);
            this.#cache.set(guildSetting.guildId, settingsForStorage);
        }

    })
    .catch(error => {
        console.error(error);
        return;
    })

    this.ready = true;
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

}

class GuildSettings {

  #settings;

  constructor(guildId, existingSettings = undefined) {
    this.guildId = guildId;
    this.#settings = existingSettings
      ? existingSettings
      : {
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
  }

  /**
   * Returns the value of the specified setting from the GuildSettings object.
   * @param {string} setting
   */
  getSetting(setting) {
    if (this.#settings[setting]) return this.#settings[setting];
    else return undefined;
  }


  /**
   * Recieve new settings JSON from the web panel and update the settings
   * @param {Object} json The new settings in safe JSON from the web panel.
   */
  setFromJSON(json) {
    this.#settings = json;
  }

  get toJSON() {
    return {
      guildId: this.guildId,
      settings: this.#settings,
    };
  }
}
