const { ReceivesFunctions } = require("../../templates/ReceivesFunctions");
const { UserProfile } = require("../UserProfiles/UserProfile");

class PartyAttendance extends ReceivesFunctions {
  /**
   * @type { Map<string, Attendee> }
   */
  #attending;

  constructor({ ...funcs }, template = undefined) {
    super(funcs);
    this.#attending = new Map();

    if (template) {
      for (const profile of template.attending) {
        this.add(profile);
      }
    }
  }

  /**
   * Add a UserProfile to the attending map.
   */
  add(profile) {
    if (!(profile instanceof UserProfile))
      throw new Error("Profile must be a UserProfile.");

    const attendee = new Attendee(profile);
    this.#saveAttendee(attendee);
  }

  /**
   * Remove a UserProfile from the attending map.
   */
  remove(id) {}

  /**
   * Get a UserProfile from the attending map.
   */
  fetch(id) {}

  #saveAttendee(attendee) {
    if (!(attendee instanceof Attendee))
      throw new Error("You must provide a valid Attendee.");

    this.#attending.set(profile.id, attendee);
  }

  /**
   * Run a function on each UserProfile in the attending map.
   *
   * @param { Function } callback The function to run on each UserProfile.
   */
  iterateAttendees(callback) {
    this.#attending.forEach(callback);
  }

  toJSON() {
    const forReturn = [];
    this.iterateAttendees((attendee) => {
      forReturn.push(attendee.toJSON());
    });

    return forReturn;
  }
}

class Attendee extends ReceivesFunctions {
  /**
   * @type { UserProfile }
   */
  profile;

  constructor(profile, { ...funcs }) {
    super(funcs);
    this.profile = profile;
  }

  toJSON() {
    return {
      profile: this.profile.toJSON(),
    };
  }
}

module.exports.Attendee = Attendee;
module.exports.PartyAttendance = PartyAttendance;
