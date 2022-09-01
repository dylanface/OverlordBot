class PartySchedule {
  date_time = "";
  date = "";
  time = "";

  constructor(template = undefined) {
    if (template) {
      this.date_time = template.date_time;
      this.date = template.date;
      this.time = template.time;
    }
  }

  /**
   * @param { DateTime } datetime The luxon DateTime object for the party.
   */
  setDateTime(datetime) {
    return this;
  }

  /**
   * @param { DateTime } datetime The luxon DateTime object for the party.
   */
  setDate(datetime) {
    return this;
  }

  /**
   * @param { DateTime } datetime The luxon DateTime object for the party.
   */
  setTime(datetime) {
    return this;
  }
}

module.exports.PartySchedule = PartySchedule;
