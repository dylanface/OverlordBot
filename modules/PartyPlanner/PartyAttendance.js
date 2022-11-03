const { CacheManager } = require("../../templates/CacheManager");
const {
  PermBitfield,
  AttendeeBits,
  DefaultPartyBitfields,
} = require("../../templates/PermBitfield");

class PartyAttendance extends CacheManager {
  constructor(callback, template = undefined) {
    if (typeof callback !== "function")
      throw new Error("Callback must be a function.");
    super(Attendee, callback);

    if (template?.attending) {
      for (const profile of template.attending) {
        this.addAttendee(profile);
      }
    }
  }

  addAttendee(profile) {
    this._add(profile.id, new Attendee(profile.id, profile));
    return this._fetch(profile.id);
  }

  get attending() {
    let numAttending = 0;

    this._cache.forEach((attendee) => {
      if (attendee.isAttending) numAttending++;
    });

    return numAttending;
  }

  toJSON() {
    const forReturn = [];
    this._cache.forEach((attendee) => {
      forReturn.push(attendee.toJSON());
    });

    return {
      attending: forReturn,
    };
  }
}

class Attendee {
  id;
  permBitfield;
  isAttending = true;
  isModerator = false;
  _recording = {
    video: false,
    audio: false,
    live: false,
  };

  constructor(id, template = undefined) {
    this.id = id;
    this.permBitfield = new PermBitfield(
      AttendeeBits,
      template?.perms || DefaultPartyBitfields.DEFAULT
    );

    this.perms = this.permBitfield.translatePerms();

    if (template !== undefined) {
      this.isAttending =
        typeof template?.isAttending === "boolean"
          ? template.isAttending
          : true;
      this.isModerator =
        typeof template?.isModerator === "boolean"
          ? template.isModerator
          : false;
    }
    if (template._recording !== undefined) {
      this._recording = template._recording;
    }
  }

  get isRecording() {
    return (
      this._recording.video || this._recording.audio || this._recording.live
    );
  }

  setRecording(type, status) {
    if (typeof this._recording[type] !== "boolean")
      throw new Error("Invalid recording type provided.");
    if (typeof status !== "boolean")
      throw new Error("Invalid status type provided.");

    this._recording[type] = status;
    this._recording = this._recording;
    return this;
  }

  setAttending(attending) {
    this.isAttending = attending;
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      perms: this.permBitfield.bits,
      isAttending: this.isAttending,
      isModerator: this.isModerator,
      _recording: this._recording,
    };
  }
}

module.exports.Attendee = Attendee;
module.exports.PartyAttendance = PartyAttendance;
