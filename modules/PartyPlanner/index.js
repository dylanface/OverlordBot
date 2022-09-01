const { v4: uuidv4 } = require("uuid");
const { EventEmitter } = require("events");

const clientPromise = require("../../database/index");

const { Party } = require("./Party");

class PartyPlanner {
  /**
   * @type { Map<string, Party> }
   */
  parties;

  client;

  constructor(client) {
    this.client = client;
    this.parties = new Map();
    this.#fetchAllParties();
  }

  #fetchAllParties() {
    clientPromise.then(async (client) => {
      const allParties = await client
        .db()
        .collection("PP_parties")
        .find({})
        .toArray();
      if (allParties.length <= 0) return console.log("No parties found.");
      for (const party of allParties) {
        this.parties.set(party.uuid, new Party(this, null, party));
      }
    });
  }

  updateParty(party) {
    clientPromise.then(async (client) => {
      const result = await client
        .db()
        .collection("PP_parties")
        .updateOne({ uuid: party.uuid }, { $set: party.toJSON() });

      if (!result || result.changedRecords <= 0)
        throw new Error("Failed to update party.");

      this.parties.set(party.uuid, party);
    });
  }

  async createParty(title) {
    const party = new Party(this, title);

    // const handler = {
    //   get: (target, key) => {
    //     if(typeof target[key] === "object" && target[key] !== null) {
    //       return new Proxy(target[key], handler)
    //     }

    //     return target[key];
    //   },
    //   set: (target, key, value) => {
    //     target[key] = value;
    //     this.updateParty(target);
    //     return true;
    //   }
    // }

    return party;
  }
}

module.exports.PartyPlanner = PartyPlanner;
