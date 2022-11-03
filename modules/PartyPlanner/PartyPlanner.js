const { v4: uuidv4 } = require("uuid");

const { PartySchedule } = require("./PartySchedule");
const { PartyRecording } = require("./PartyRecording");
const { PartyAttendance } = require("./PartyAttendance");

const clientPromise = require("../../database/index");
const { CacheManager } = require("../../templates/CacheManager");

class Party {
  title = "";
  uuid;

  recording = false;
  schedule;
  attendance;
  game;

  timezone = "America/Los_Angeles";

  /**
   * @param { String } title The title of the party.
   */
  constructor(callback, title = undefined, template = undefined) {
    if (typeof callback !== "function")
      throw new Error("Callback must be a function.");

    if (!template) {
      if (!title)
        throw new Error("Title must be provided when creating a novel party.");

      this.title = title;
      this.uuid = uuidv4();
      this.attendance = new PartyAttendance(() => callback(this));
      // this.schedule = new PartySchedule(funcs);
      // this.game = new PartyGames();
    } else {
      this.title = template.title;
      this.uuid = template.uuid;
      this.attendance = new PartyAttendance(
        () => callback(this),
        template.attendance
      );
      // this.schedule = new PartySchedule(funcs, template.schedule);
      // this.game = new PartyGame(template.game);
    }
  }

  /**
   * @param { Boolean } recording Set the recording status of the party.
   */
  setRecording() {
    let shouldReturn = false;
    this.attendance._cache.forEach((attendee) => {
      if (shouldReturn) return;
      if (attendee.isRecording) {
        this.recording = true;
        shouldReturn = true;
      }
      return;
    });

    return this;
  }

  /**
   * @param { String } title The title of the party.
   */
  setTitle(title) {
    this.title = title;
    return this;
  }

  /**
   * @param { String } timezone The timezone for the party as a string.
   */
  setTimezone(timezone) {
    this.timezone = timezone;
    return this;
  }

  toJSON() {
    return {
      title: this.title,
      uuid: this.uuid,
      schedule: this.schedule?.toJSON() || {},
      attendance: this.attendance?.toJSON() || {},
      game: this.game?.toJSON() || {},
    };
  }
}

module.exports.Party = Party;

class PartyPlanner extends CacheManager {
  client;

  constructor(client) {
    super(Party, (party) => {
      const inDB = this.#updateParty(party);
      if (!inDB) throw new Error("Party could not be saved.");
      else console.log("Party saved.");
    });
    this.client = client;

    this.#fetchAllParties();
  }

  #fetchAllParties() {
    return new Promise((resolve, reject) => {
      clientPromise
        .then(async (client) => {
          const allParties = await client
            .db()
            .collection("PP_parties")
            .find({})
            .toArray();

          if (allParties.length <= 0) return;
          for (const party of allParties) {
            const newParty = new Party(
              (party) => {
                const inDB = this.#updateParty(party);
                if (!inDB) throw new Error("Party could not be saved.");
                else console.log("Party saved.");
              },
              null,
              party
            );
            this._add(newParty.uuid, newParty);
          }
          resolve();
        })
        .catch(reject);
    });
  }

  #fetchParty(uuid) {
    return new Promise((resolve, reject) => {
      clientPromise
        .then(async (client) => {
          const party = await client
            .db()
            .collection("PP_parties")
            .findOne({ uuid: uuid });

          if (party !== null) {
            this._add(
              party.uuid,
              new Party(
                (party) => {
                  const inDB = this.#updateParty(party);
                  if (!inDB) throw new Error("Party could not be saved.");
                  else console.log("Party saved.");
                },
                null,
                party
              )
            );
            resolve(this._fetch(party.uuid));
          } else {
            reject(new Error("No party found."));
          }
        })
        .catch(reject);
    });
  }

  #updateParty(party) {
    if (!(party instanceof Party)) throw new Error("Invalid Party Provided.");

    clientPromise.then(async (client) => {
      const result = await client
        .db()
        .collection("PP_parties")
        .updateOne(
          { uuid: party.uuid },
          { $set: party.toJSON() },
          { upsert: true }
        );

      if (!result || result.changedRecords <= 0)
        throw new Error("Failed to update party.");
    });

    return party;
  }

  async getParty(query, options = {}) {
    if (options.type) {
      if (options.type === "title") {
        let matchingParty = null;
        this._cache.forEach((party) => {
          if (party.title.toLowerCase() === query.toLowerCase())
            matchingParty = party;
        });
        if (!matchingParty) return { error: new Error("No party found.") };
        return this._fetch(matchingParty.uuid);
      }
    }
    if (this._cache.has(query)) return this._fetch(query);
    else {
      await this.#fetchParty(query)
        .then((party) => {
          return party;
        })
        .catch((err) => {
          return { error: err };
        });
    }
  }

  async createParty(title) {
    const party = new Party((party) => {
      const inDB = this.#updateParty(party);
      if (!inDB) throw new Error("Party could not be saved.");
      else console.log("Party saved.");
    }, title);
    this._add(party.id, party);

    const proxyParty = await this.getParty(party.id);
    return proxyParty;
  }
}

module.exports.PartyPlanner = PartyPlanner;
