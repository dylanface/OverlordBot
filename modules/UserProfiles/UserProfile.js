const clientPromise = require("../../database/index");
const { ReceivesFunctions } = require("../../templates/ReceivesFunctions");
const { SelfUpdatingMap } = require("../../templates/SelfUpdatingMap");

class UserProfile extends ReceivesFunctions {
  createdAt;

  id = "";

  timezone = "America/Los_Angeles";

  /**
   * @type { "DM" | "Guild" }
   */
  contactMethod = "DM";

  constructor(funcs, discordId = undefined, template = undefined) {
    super(funcs);

    if (template) {
      this.createdAt = template.createdAt;
      this.id = template.id;
      this.timezone = template.timezone;
      this.contactMethod = template.contactMethod;
    } else {
      if (!discordId) throw new Error("No discord id provided.");
      this.id = discordId;
      this.createdAt = new Date();
    }
  }

  /**
   * @param { string } timezone The timezone of the party host.
   */
  setTimezone(timezone) {
    this.timezone = timezone;
    return this;
  }

  /**
   * @param { string } contact The prefered contact method for this user.
   */
  setContactMethod(contact) {
    this.contactMethod = contact;
    return this;
  }

  async asDiscordUser() {
    return await this.getDiscordUserFromProfile(this);
  }

  save() {
    this.update(this);
    console.log("Saved: " + this.id);
  }

  toJSON() {
    return {
      createdAt: this.createdAt,
      id: this.id,
      timezone: this.timezone,
      contactMethod: this.contactMethod,
    };
  }
}

module.exports.UserProfile = UserProfile;

class UserProfileManager {
  /**
   * @type { SelfUpdatingMap }
   */
  _profiles;

  _functions;

  constructor(client) {
    this.client = client;
    this._profiles = new SelfUpdatingMap(this.#update.bind(this));
    this._functions = {
      getDiscordUserFromProfile: this.getDiscordUserFromProfile.bind(this),
      update: this.#update.bind(this),
    };

    this.#fetchAllProfiles();
  }

  #fetchAllProfiles() {
    return new Promise((resolve, reject) => {
      clientPromise
        .then(async (client) => {
          const allProfiles = await client
            .db()
            .collection("C_user_profiles")
            .find({})
            .toArray();

          if (allProfiles.length <= 0) return;
          for (const profile of allProfiles) {
            this._profiles.set(
              profile.id,
              new UserProfile(this._functions, null, profile)
            );
          }
        })
        .catch(reject);

      resolve();
    });
  }

  #fetchProfile(discordId) {
    return new Promise((resolve, reject) => {
      clientPromise
        .then(async (client) => {
          const result = await client
            .db()
            .collection("C_user_profiles")
            .findOne({ id: discordId });

          if (result !== null) {
            this._profiles.set(
              discordId,
              new UserProfile(this._functions, null, result)
            );
            resolve(this._profiles.get(discordId));
          } else {
            const profile = this.createProfile(discordId);
            resolve(profile);
          }
        })
        .catch(reject);
    });
  }

  #update(profile) {
    if (!(profile instanceof UserProfile))
      throw new Error("Invalid profile provided.");

    clientPromise.then(async (client) => {
      const result = await client
        .db()
        .collection("C_user_profiles")
        .updateOne(
          { id: profile.id },
          { $set: profile.toJSON() },
          { upsert: true }
        );

      if (!result || !result.acknowledged) {
        throw new Error("Failed to update profile.");
      } else console.log(result);
    });

    return profile;
  }

  createProfile(discordId) {
    if (this._profiles.has(discordId)) return this._profiles.get(discordId);
    const profile = new UserProfile(this._functions, discordId);
    this.#update(profile);

    return profile;
  }

  async getProfile(discordId) {
    if (this._profiles.has(discordId)) return this._profiles.get(discordId);
    const profile = await this.#fetchProfile(discordId);
    return profile;
  }

  async getDiscordUserFromProfile(profile) {
    if (!(profile instanceof UserProfile))
      throw new Error("Invalid profile provided.");

    const user = await this.client.users.fetch(profile.id);
    return user;
  }
}

module.exports.UserProfileManager = UserProfileManager;
