import clientPromise from "../database/index";
import { ObjectManager } from "../templates/ObjectManager";

export class GuildSettingsManager extends ObjectManager {
  ready = false;

  constructor() {
    super(GuildSettings, (settings: any) => {
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
    // console.log(`GuildSettingsManager ready state: ${this.ready}`);
  }

  /**
   *
   * @param guildId The snowflake of the guild to remove settings for.
   * @param guild_settings The GuildSettings object to update in the DB.
   */
  updateGuildSettingsDB(guildId: string, guild_settings: GuildSettings): void {
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
    });
  }

  /**
   * Fetch the GuildSettings object for the guild with the given guildId.
   * If the guild does not have settings, add default settings for the guild then fetch the settings.
   * @param guildId The snowflake of the guild to fetch settings for.
   *
   * @returns A promise that resolves to the GuildSettings object for the given guildId.
   */
  fetch(guildId: string): Promise<GuildSettings> {
    return new Promise((resolve, reject) => {
      if (!this.ready) {
        reject(new Error("GuildSettingsManager is not ready."));
        return;
      }
      this._fetch(guildId)
        .then((settings) => {
          resolve(settings);
          return;
        })
        .catch((err) => {
          if (
            err.message === "The key provided could not be found in the cache."
          ) {
            this.addGuildSettings(guildId)
              .then((settings) => {
                resolve(settings);
                return;
              })
              .catch((err) => {
                reject(err);
                return;
              });
          } else {
            reject(err);
            return;
          }
        });
    });
  }

  /**
   * Add a new GuildSettings object to the cache for the given guildId.
   * @param guildId The snowflake of the guild to add default settings for.
   */
  addGuildSettings(guildId: string) {
    const guildSettings = new GuildSettings(guildId);
    return this._add(guildId, guildSettings);
  }
}

class GuildSettings {
  editLogs: EditLogSettings;
  moderationLogs: ModerationLogSettings;
  guildId: string;

  constructor(guildId: string, existingSettings?: any) {
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
    let json = {} as any;
    json.guildId = this.guildId;
    json.editLogs = this.editLogs.toJSON();
    json.moderationLogs = this.moderationLogs.toJSON();

    return json;
  }
}

class EditLogSettings {
  enabled: boolean;
  web: boolean;
  channelId?: string | null;
  // regex: {
  //   enabled: boolean;
  //   ignorePatterns: string[];
  //   forcePatterns: string[];
  // };
  messageDiff: {
    enabled: boolean;
    characters: number;
  };

  constructor(template?: any) {
    if (template !== undefined) {
      this.enabled = template?.enabled;
      this.web = template?.web;
      this.channelId = template?.channelId;
      // this.regex = template?.regex;
      this.messageDiff = template?.messageDiff;
      // this.reactions = template?.reactions;
    } else {
      this.enabled = false;
      this.web = false;
      this.channelId = null;
      // this.regex = {
      //   enabled: false,
      //   ignorePatterns: [],
      //   forcePatterns: [],
      // };
      this.messageDiff = {
        enabled: false,
        characters: 3,
      };
    }
  }

  toJSON() {
    return {
      enabled: this.enabled,
      web: this.web,
      channelId: this.channelId,
      // regex: this.regex,
      messageDiff: this.messageDiff,
      // reactions: this.reactions,
    };
  }
}

class ModerationLogSettings {
  enabled: boolean;
  web: boolean;
  channelId?: string | null;
  seperateActions: boolean;

  constructor(template?: any) {
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
