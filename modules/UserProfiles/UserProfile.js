const clientPromise = require("../../database/index");
const { CacheManager } = require("../../templates/CacheManager");
const {
  PermBitfield,
  AttendeeBits,
  DefaultPartyBitfields,
} = require("../../templates/PermBitfield");

class UserProfile {
  createdAt;

  id = "";

  timezone = "America/Los_Angeles";

  /**
   * @type { "DM" | "Guild" }
   */
  contactMethod = "DM";

  constructor(discordId = undefined, template = undefined) {
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

class UserProfileManager extends CacheManager {
  constructor(client) {
    super(UserProfile, (profile) => {
      const inDB = this.#updateProfile(profile);
      if (!inDB) throw new Error("Profile could not be saved.");
      else console.log("Profile saved.");
    });
    this.client = client;

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
            this._add(profile.id, new UserProfile(null, profile));
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
            this._add(discordId, new UserProfile(null, result));
            resolve(this._fetch(discordId));
          } else {
            const profile = this.createProfile(discordId);
            resolve(profile);
          }
        })
        .catch(reject);
    });
  }

  #updateProfile(profile) {
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
      }
    });

    // this._add(profile.id, profile);
    return profile;
  }

  createProfile(discordId) {
    if (this._profiles.has(discordId)) return this._profiles.get(discordId);
    const profile = new UserProfile(this._functions, discordId);
    this._add(profile.id, profile);

    return this.getProfile(discordId);
  }

  async getProfile(discordId) {
    if (this._fetch(discordId)) return this._fetch(discordId);
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
