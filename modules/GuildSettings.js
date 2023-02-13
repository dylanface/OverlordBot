const clientPromise = require("../database/index");
const { ObjectManager } = require("../templates/ObjectManager");

class GuildSettingsManager extends ObjectManager {
  ready = false;

  constructor() {
    super(GuildSettings, (settings) => {
      console.log("GuildSettingsManager callback called.");
      this.updateGuildSettingsDB(settings.guildId, settings);
    });

    this.#init();
  }

  /**
   * Fetch existing settings for guilds from mongodb and set ready state to true on success.
   */
  #init() {
    clientPromise
      .then(async (client) => {
        const settingsCol = client.db().collection("guilds");
        const allFetchedSettings = await settingsCol.find({}).toArray();

        for (let guild of allFetchedSettings) {
          const settingsForStorage = new GuildSettings(
            guild.id,
            guild.settings || undefined
          );

          this._add(guild.id, settingsForStorage, { cache: true });
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
   *
   * @param {string} guildId The snowflake of the guild to remove settings for.
   * @param {GuildSettings} guild_settings The GuildSettings object to update in the DB.
   */
  updateGuildSettingsDB(guildId, guild_settings) {
    let result = undefined;
    clientPromise.then(async (client) => {
      const settingsCol = client.db().collection("guilds");

      result = await settingsCol.updateOne(
        { id: `${guildId}` },
        { $set: { settings: guild_settings } }
      );

      if (result === undefined)
        throw new Error("GuildSettings could not be saved.");
      else console.log("GuildSettings saved.");

      console.log(result);
    });
  }

  /**
   * Fetch the GuildSettings object for the guild with the given guildId.
   * If the guild does not have settings, add default settings for the guild then fetch the settings.
   * @param {string} guildId The snowflake of the guild to fetch settings for.
   *
   * @returns {Promise<GuildSettings>} A promise that resolves to the GuildSettings object for the given guildId.
   */
  fetch(guildId) {
    return new Promise((resolve, reject) => {
      this._fetch(guildId)
        .then((settings) => {
          resolve(settings);
        })
        .catch((err) => {
          if (
            err.message === "The key provided could not be found in the cache."
          ) {
            this.addGuildSettings(guildId)
              .then((settings) => {
                resolve(settings);
              })
              .catch((err) => {
                reject(err);
              });
          } else {
            reject(err);
          }
        });
    });
  }

  /**
   * Add a new GuildSettings object to the cache for the given guildId.
   * @param {string} guildId The snowflake of the guild to add default settings for.
   */
  addGuildSettings(guildId) {
    const guildSettings = new GuildSettings(guildId);
    return this._add(guildId, guildSettings);
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
      this.moderationLogs = new ModerationLogSettings();
    }
  }

  toJSON() {
    let json = {};
    json.guildId = this.guildId;
    json.editLogs = this.editLogs.toJSON();
    json.moderationLogs = this.moderationLogs.toJSON();

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
      // this.reactions = template?.reactions;
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
      // this.reactions = {
      //   enabled: false,
      //   overlordEmoji: false,
      //   ignoreEmoji: [],
      //   forceEmoji: [],
      // };
    }
  }

  toJSON() {
    return {
      enabled: this.enabled,
      web: this.web,
      channelId: this.channelId,
      regex: this.regex,
      messageDiff: this.messageDiff,
      // reactions: this.reactions,
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
