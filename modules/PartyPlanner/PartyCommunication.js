class PartyCommunication {
  /**
   * Create a dynamic announcement embed for the party.
   *
   * @returns { EmbedBuilder } The built embed for the party.
   */
  announcementEmbed() {
    const announcementEmbed = new EmbedBuilder()
      .setTitle(this.title)
      .setDescription("This is a test embed.")
      .setFooter({
        text: this.host.assigned.user.tag,
        iconUrl: this.host.assigned.user.avatarURL(),
      });

    return announcementEmbed;
  }

  #contactEmbed(user, message) {
    const contactEmbed = new EmbedBuilder()
      .setTitle("Party Planner")
      .setDescription(message)
      .setFooter({
        text: user.user.tag,
        iconUrl: user.user.avatarURL(),
      });

    return contactEmbed;
  }

  /**
   * Contact a user or host via their preferred contact method.
   */
  contact(userId, message, group = "attendee") {
    if (!message || !userId) {
      throw new Error("message and userId are required to contact a user.");
    }

    switch (group) {
      case "attendee":
        const attendee = this.attendance.attending.get(userId);
        if (!attendee) throw new Error("User is not attending the party.");
        const attendeeContactMethod = attendee.contact;
        if (attendeeContactMethod === "DM") {
          attendee.user.send(this.#contactEmbed(attendee, message));
        }
        break;

      case "moderation":
        const mod = this.moderation.assigned.get(userId);
        if (!mod) throw new Error("User is not a moderator for the party.");
        const modContactMethod = mod.contact;
        break;

      case "host":
        if (this.host.assigned.user.id === userId) {
          const hostContactMethod = this.host.assigned.contact;
        } else throw new Error("User is not the host of the party.");
        break;
    }
  }
}

module.exports.PartyCommunication = PartyCommunication;
