const { PartyAttendance } = require("./PartyAttendance");
const { PartyCommunication } = require("./PartyCommunication");
const { PartyGames } = require("./PartyGames");
const { PartyModeration } = require("./PartyModeration");
const { PartyPolls } = require("./PartyPolls");
const { PartyRecording } = require("./PartyRecording");
const { PartySchedule } = require("./PartySchedule");

class Party {
  title = "";
  uuid;
  host;
  schedule;
  moderation;
  recording;
  attendance;
  game;

  /**
   * @type { PartyPlanner }
   */
  manager;

  /**
   * @param { String } title The title of the party.
   */
  constructor(manager, title = undefined, template = undefined) {
    if (!manager) throw new Error("No manager provided.");
    if (!(manager instanceof PartyPlanner)) throw new Error("Invalid manager.");
    this.manager = manager;

    if (!template) {
      if (!title)
        throw new Error("Title must be provided when creating a novel party.");

      this.title = title;
      this.uuid = uuidv4();
      // this.host = new PartyHost();
      this.schedule = new PartySchedule();
      this.moderation = new PartyModeration();
      this.recording = new PartyRecording();
      this.attendance = new PartyAttendance(this);
      // this.game = new PartyGames();
    } else {
      this.title = template.title;
      this.uuid = template.uuid;
      // this.host = new PartyHost(template.host);
      this.schedule = new PartySchedule(template.schedule);
      this.moderation = new PartyModeration(template.moderation);
      this.recording = new PartyRecording(template.recording);
      this.attendance = new PartyAttendance(this, template.attendance);
      // this.game = new PartyGame(template.game);
    }
  }

  get host() {
    this.attendance.host;
  }

  save() {
    this.manager.updateParty(this);
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

class Party {
  title = "";
  uuid;
  host;
  schedule;
  moderation;
  recording;
  attendance;
  game;

  /**
   * @type { PartyPlanner }
   */
  manager;

  /**
   * @param { String } title The title of the party.
   */
  constructor(manager, title = undefined, template = undefined) {
    if (!manager) throw new Error("No manager provided.");
    if (!(manager instanceof PartyPlanner)) throw new Error("Invalid manager.");
    this.manager = manager;

    if (!template) {
      if (!title)
        throw new Error("Title must be provided when creating a novel party.");

      this.title = title;
      this.uuid = uuidv4();
      // this.host = new PartyHost();
      this.schedule = new PartySchedule();
      this.moderation = new PartyModeration();
      this.recording = new PartyRecording();
      this.attendance = new PartyAttendance(this);
      // this.game = new PartyGames();
    } else {
      this.title = template.title;
      this.uuid = template.uuid;
      // this.host = new PartyHost(template.host);
      this.schedule = new PartySchedule(template.schedule);
      this.moderation = new PartyModeration(template.moderation);
      this.recording = new PartyRecording(template.recording);
      this.attendance = new PartyAttendance(this, template.attendance);
      // this.game = new PartyGame(template.game);
    }
  }

  get host() {
    this.attendance.host;
  }

  save() {
    this.manager.updateParty(this);
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
