const clientPromise = require("../../database/index");
const { SelfUpdatingMap } = require("../../templates/SelfUpdatingMap");

class UserProfile {
  createdAt;

  id = "";

  timezone = "America/Los_Angeles";

  /**
   * @type { "DM" | "Guild" }
   */
  contactMethod = "DM";

  /**
   * @type { UserProfileManager }
   */
  manager;

  constructor(manager, discordId = undefined, template = undefined) {
    if (!manager) throw new Error("No manager provided.");
    if (!(manager instanceof UserProfileManager))
      throw new Error("Invalid manager type.");
    this.manager = manager;
    // super({ mtype: UserProfileManager, manager }, UserProfile);

    if (template) {
      this.createdAt = template.createdAt;
      this.id = template.id;
      this.timezone = template.timezone;
      this.contact = template.contact;
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

    // this.report(this);
    return this;
  }

  /**
   * @param { string } contact The prefered contact method for this user.
   */
  setContactMethod(contact) {
    this.contactMethod = contact;

    // this.report(this);
    return this;
  }

  async asDiscordUser() {
    return await this.manager.getDiscordUserFromProfile(this);
  }

  toJSON() {
    return {
      createdAt: this.createdAt,
      id: this.id,
      timezone: this.timezone,
      contact: this.contactMethod,
    };
  }
}

class UserProfileManager {
  /**
   * @type { SelfUpdatingMap }
   */
  #profiles;

  constructor(client) {
    this.client = client;
    this.#profiles = new SelfUpdatingMap();
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
            this.#profiles.set(
              profile.id,
              new UserProfile(this, null, profile)
            );

            this.#profiles.get(profile.id).on("dataChanged", (res) => {
              this.#updateProfile(res);
            });
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
            this.#profiles.set(discordId, new UserProfile(this, null, result));
            resolve(this.#profiles.get(discordId));
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

      if (!result || (result.modifiedCount <= 0 && result.upsertedCount <= 0)) {
        throw new Error("Failed to update profile.");
      } else {
        this.#profiles.set(profile.id, profile);
      }
    });

    return profile;
  }

  createProfile(discordId) {
    if (this.#profiles.has(discordId)) return this.#profiles.get(discordId);
    const profile = new UserProfile(this, discordId);
    profile.on("dataChanged", (res) => {
      this.#updateProfile(res);
    });
    this.#updateProfile(profile);

    return profile;
  }

  async getProfile(discordId) {
    if (this.#profiles.has(discordId)) return this.#profiles.get(discordId);
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
module.exports.UserProfile = UserProfile;
