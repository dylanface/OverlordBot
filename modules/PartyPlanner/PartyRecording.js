class PartyRecording {
  audio = false;
  video = false;
  stream = false;

  constructor(template = undefined) {
    if (template) {
      this.audio = template.audio;
      this.video = template.video;
      this.stream = template.stream;
    }
  }

  /**
   * @param { Boolean } record Whether or not you plan to record the party.
   */
  setRecording(record) {
    return this;
  }

  /**
   * @param { Boolean } stream Whether or not you plan to stream the party.
   */
  setStreaming(stream) {
    return this;
  }
}

module.exports.PartyRecording = PartyRecording;
