module.exports.Timezones = class Timezones {
  #json_list = [];

  constructor() {
    this.#json_list = require("../../json/timezones/new_timezones.json");
  }

  search(query) {
    return (
      this.#json_list.filter((timezone) =>
        timezone.toLowerCase().replace("_", " ").includes(query.toLowerCase())
      ) || []
    );
  }
};
