class Poll {
  /**
   * @type { Map<string, PollOption> }
   */
  #submissions;

  #settings = [];

  constructor(settings = []) {
    this.#submissions = new Map();
    this.#settings = settings;
  }

  get submissions() {
    return this.#submissions;
  }

  get settings() {}

  submit(id, options) {
    if (typeof options === "string")
      throw new Error("Options must be an array.");
    if (options.length <= 0) throw new Error("Options must not be empty.");
    this.#submissions.set(id, options);
  }
}

class PartyPolls {}

module.exports.PartyPolls = PartyPolls;
