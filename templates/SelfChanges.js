const { EventEmitter } = require("events");
// const { Party } = require("../modules/PartyPlanner/PartyPlanner");

class ReportToParty extends EventEmitter {
  /**
   * @type { Party }
   */
  party;

  constructor(party) {
    super();

    if (!party) throw new Error("No party provided.");
    if (!(party instanceof Party)) throw new Error("Invalid party instance.");
    this.party = party;
  }

  report() {
    this.party.save();
  }
}

class ReportToManager extends EventEmitter {
  #holds;

  constructor({ mtype, manager }, holds) {
    super();

    if (!mtype) throw new Error("No manager type provided.");
    if (!manager) throw new Error("No manager provided.");

    if (!holds) throw new Error("No holds type provided.");

    if (!(manager instanceof mtype)) throw new Error("Invalid manager type.");

    this.#holds = holds;

    this.manager = manager;
  }

  report(data) {
    if (!data) throw new Error("No data provided.");
    if (!(data instanceof this.#holds))
      throw new Error("Invalid data type, this report will not send.");

    this.emit("dataChanged", data);
  }
}

module.exports.ReportToManager = ReportToManager;
module.exports.ReportToParty = ReportToParty;
