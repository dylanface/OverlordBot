class PartyModeration {
  /**
   * @type { Map<string, PartyPlannerUserProfile> }
   */
  assigned;

  required = false;
  responsibilities = "";

  constructor(template = undefined) {
    if (template) {
      for (const profile of template.assigned) {
        this.add(profile);
      }
      this.required = template.required;
      this.responsibilities = template.responsibilities;
    }
  }

  /**
   * @param { Boolean } required Whether or not the chancellor is required.
   */
  setRequired(required) {
    return this;
  }

  /**
   * @param { User } user The discord user that is hosting the party.
   */
  assignChancellor(user) {
    return this;
  }

  /**
   * @param { String } response The responsibilities of the chancellor.
   */
  setResponsibilities(response) {
    return this;
  }
}

module.exports.PartyModeration = PartyModeration;
