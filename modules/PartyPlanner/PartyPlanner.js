const { v4: uuidv4 } = require("uuid");

const { ReceivesFunctions } = require("../../templates/ReceivesFunctions");
const { SelfUpdatingMap } = require("../../templates/SelfUpdatingMap");

const { PartySchedule } = require("./PartySchedule");
const { PartyModeration } = require("./PartyModeration");
const { PartyRecording } = require("./PartyRecording");
const { PartyAttendance } = require("./PartyAttendance");

const clientPromise = require("../../database/index");

class Party extends ReceivesFunctions {
  title = "";
  uuid;
  host;
  schedule;
  moderation;
  recording;
  attendance;
  game;

  /**
   * @param { String } title The title of the party.
   */
  constructor({ ...funcs }, title = undefined, template = undefined) {
    super(funcs);

    if (!template) {
      if (!title)
        throw new Error("Title must be provided when creating a novel party.");

      this.title = title;
      this.uuid = uuidv4();
      // this.host = new PartyHost();
      this.schedule = new PartySchedule();
      this.moderation = new PartyModeration();
      this.recording = new PartyRecording();
      this.attendance = new PartyAttendance(funcs);
      // this.game = new PartyGames();
    } else {
      this.title = template.title;
      this.uuid = template.uuid;
      // this.host = new PartyHost(template.host);
      this.schedule = new PartySchedule(template.schedule);
      this.moderation = new PartyModeration(template.moderation);
      this.recording = new PartyRecording(template.recording);
      this.attendance = new PartyAttendance(funcs, template.attendance);
      // this.game = new PartyGame(template.game);
    }
  }

  get host() {
    this.attendance.host;
  }

  save() {
    this.update(this);
  }

  toJSON() {
    return {
      title: this.title,
      uuid: this.uuid,
      host: this.host.toJSON(),
      schedule: this.schedule.toJSON(),
      moderation: this.moderation.toJSON(),
      recording: this.recording.toJSON(),
      attendance: this.attendance.toJSON(),
      game: this.game.toJSON(),
    };
  }
}

module.exports.Party = Party;

class PartyPlanner {
  /**
   * @type { Map<string, Party> }
   */
  parties;

  client;

  _functions;

  constructor(client) {
    this.client = client;
    this.parties = new Map();
    this._functions = {
      update: this.updateParty.bind(this),
    };

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
        this.parties.set(party.uuid, new Party(this._functions, null, party));
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
    });
  }

  async createParty(title) {
    const party = new Party(this._functions, title);

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
