const { CommandInteraction, Client } = require("discord.js");
const {
  SlashCommandSubcommandBuilder,
  SlashCommandStringOption,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
} = require("@discordjs/builders");

const { DateTime } = require("luxon");

const { Party } = require("../../../modules/PartyPlanner/PartyPlanner");
const { UserProfile } = require("../../../modules/UserProfiles/UserProfile");
const { validate: uuidValidate } = require("uuid");
const { prompt } = require("../../../util/modal_maker");

module.exports = {
  enabled: true,
  name: "view",
  data: new SlashCommandSubcommandBuilder()
    .setName("view")
    .setDescription("View a party managed by PartyPlanner.")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("party")
        .setDescription("The uuid or title of the Party you want to view.")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  /**
   * @param { CommandInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const partyInfo = interaction.options.getString("party");
    const searchType = uuidValidate(partyInfo) ? "uuid" : "title";

    /**
     * @type { Party }
     */
    const party = await client.PartyPlanner.getParty(partyInfo, {
      type: searchType,
    });

    /**
     * @type { UserProfile }
     */
    const profile = await client.UserProfileManager.getProfile(
      interaction.user.id
    );

    if (!party || party.error) {
      await interaction.editReply({
        content: `Failed to find a party with "${partyInfo}"`,
      });
      return;
    }

    const joinButton = new ButtonBuilder()
      .setCustomId("join")
      .setLabel("Join")
      .setStyle(1);
    const leaveButton = new ButtonBuilder()
      .setCustomId("leave")
      .setLabel("Leave")
      .setStyle(4);
    const editButton = new ButtonBuilder()
      .setCustomId("edit")
      .setLabel("Edit Title")
      .setStyle(1);
    const recordingButton = new ButtonBuilder()
      .setCustomId("request_recording")
      .setLabel("Request Recording")
      .setStyle(3);

    const buttonRow = new ActionRowBuilder().addComponents(
      joinButton,
      leaveButton,
      editButton
    );

    const partyEmbed = new EmbedBuilder()
      .setTitle(party.title)
      .setDescription(
        `Current users: ${party.attendance.attending.toString()}`
      );

    await interaction.editReply({
      embeds: [partyEmbed],
      components: [buttonRow],
    });

    const filter = (i) =>
      (i.customId === "join" ||
        i.customId === "leave" ||
        i.customId === "edit") &&
      i.user.id === interaction.user.id;

    const collector = interaction.channel.createMessageComponentCollector({
      filter,
      time: 150000,
    });

    collector.on("collect", async (i) => {
      if (i.deferred || i.replied) return collector.stop();
      console.log("Reply to: " + i.customId);
      const attendee = party.attendance._fetch(profile.id);

      switch (i.customId) {
        case "join":
          party.attendance.addAttendee(profile);
          i.update({});
          break;

        case "leave":
          if (attendee) {
            attendee.setAttending(false);
          }
          i.update({});
          break;

        // case "request_recording":
        //   const { choice } = await options_prompt(
        //     i,
        //     client,
        //     [
        //       { label: "Live", value: "live" },
        //       { label: "Video", value: "video" },
        //       { label: "Audio", value: "audio" },
        //     ],
        //     true
        //   );
        //   console.log(choice);

        case "edit":
          const { response } = await prompt(
            i,
            client,
            "What is the title of your party?"
          );
          if (!response) return i.update("Cancelled.");
          party.setTitle(response);
          break;
      }

      const newEmbed = new EmbedBuilder()
        .setTitle(party.title)
        .setDescription(
          `Current users: ${party.attendance.attending.toString()}`
        );

      await interaction.editReply({
        embeds: [newEmbed],
      });
    });
  },
};
