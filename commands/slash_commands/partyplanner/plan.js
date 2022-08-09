const { CommandInteraction, Client, TextInputStyle } = require("discord.js");
const {
  SlashCommandSubcommandBuilder,
  SlashCommandStringOption,
  ModalBuilder,
  ActionRowBuilder,
  TextInputBuilder,
  SelectMenuBuilder,
  SelectMenuOptionBuilder,
  EmbedBuilder,
} = require("@discordjs/builders");

const { DateTime } = require("luxon");

module.exports = {
  enabled: true,
  name: "plan",
  data: new SlashCommandSubcommandBuilder()
    .setName("plan")
    .setDescription("Begin the process of hosting a community event.")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("timezone")
        .setDescription("The timezone of the event.")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  /**
   * @param { CommandInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    const timezone = interaction.options.getString("timezone");

    const timezoneNow = DateTime.now().setZone(timezone);
    let eventDate = timezoneNow.toFormat("yyyy-MM-dd");
    let eventTime = timezoneNow.toFormat("HH:mm:ss");

    const eventModal = new ModalBuilder()
      .setCustomId("event_questions_modal")
      .setTitle("Plan a Community Event");

    const gameModal = new ModalBuilder()
      .setCustomId("game_questions_modal")
      .setTitle("About Your Events Entertainment");

    const event_title = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("event_title")
        .setLabel("Event Title")
        .setPlaceholder("Enter the title of the event.")
        .setStyle(TextInputStyle.Short)
    );

    const event_date = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("event_date")
        .setLabel("Date (YYYY-MM-DD)")
        .setPlaceholder("Enter the date you want to host the event.")
        .setValue(eventDate)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(10)
        .setMinLength(10)
    );

    const event_time = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("event_time")
        .setLabel("Time 24HR (HH:MM:SS)")
        .setPlaceholder("Enter the time you want to host the event.")
        .setValue(eventTime)
        .setStyle(TextInputStyle.Short)
        .setMaxLength(8)
        .setMinLength(8)
    );

    const event_chancellor = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("event_chancellor")
        .setLabel("Chancellor Required (Yes/No)")
        .setPlaceholder("Would you like a chancelor to attend the event?")
        .setStyle(TextInputStyle.Short)
        .setMaxLength(3)
        .setMinLength(2)
    );

    const event_record = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("event_record")
        .setLabel("Event Recording (Yes/No)")
        .setPlaceholder("Do you plan on recording or livestreaming the event?")
        .setStyle(TextInputStyle.Short)
        .setMaxLength(3)
        .setMinLength(2)
    );

    const game_title = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("game_title")
        .setLabel("Game Title")
        .setPlaceholder("Enter the title of the game used for event.")
        .setStyle(TextInputStyle.Short)
    );

    const game_player_limit = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("game_player_limit")
        .setLabel("Game Player Limit")
        .setPlaceholder(
          "What is the max amount of players that can join a lobby in the game?"
        )
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
    );

    const game_cost = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("game_cost")
        .setLabel("Game Cost ($00.00 USD)")
        .setPlaceholder("Enter the cost of the game used for event.")
        .setStyle(TextInputStyle.Short)
        .setRequired(false)
    );

    const game_available = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId("game_available")
        .setLabel("Game Available")
        .setPlaceholder("What are the necessary materials for your event?")
        .setStyle(TextInputStyle.Paragraph)
    );

    let [
      eventTitle,
      eventChancellor,
      eventRecord,
      gameTitle,
      gamePlayerLimit,
      gameCost,
      gameAvailable,
    ] = "";

    eventModal.addComponents(
      event_title,
      event_date,
      event_time,
      event_chancellor,
      event_record
    );

    gameModal.addComponents(
      game_title,
      game_player_limit,
      game_cost,
      game_available
    );

    await interaction.showModal(eventModal);
    // await interaction.showModal(gameModal);

    const event_modal_filter = (mod) =>
      mod.customId === "event_questions_modal";
    interaction
      .awaitModalSubmit({ filter: event_modal_filter, time: 5 * 60 * 1000 })
      .then(async (i) => {
        eventTitle = i.fields.getTextInputValue("event_title");
        eventDate = i.fields.getTextInputValue("event_date");
        eventTime = i.fields.getTextInputValue("event_time");
        eventChancellor = i.fields.getTextInputValue("event_chancellor");
        eventRecord = i.fields.getTextInputValue("event_record");

        // gameTitle = i.getTextInput("game_title");
        // gamePlayerLimit = i.getTextInput("game_player_limit");
        // gameCost = i.getTextInput("game_cost");
        // gameAvailable = i.getTextInput("game_available");

        const combined = `${eventDate}T${eventTime} ${timezone}`;

        const dateTime = DateTime.fromFormat(
          combined,
          "yyyy-MM-dd'T'HH:mm:ss z"
        );

        const event_modal_response = new EmbedBuilder().addFields(
          {
            name: "Event Title",
            value: eventTitle,
          },
          {
            name: "Event Date",
            value: eventDate,
          },
          {
            name: "Event Time",
            value: eventTime,
          },
          {
            name: "Chancellor Required",
            value: eventChancellor,
          },
          {
            name: "Event Recording",
            value: eventRecord,
          },
          {
            name: "DateTime",
            value: dateTime.toISO(),
          }
        );

        await i.reply({
          embeds: [event_modal_response],
          ephemeral: true,
        });
      })
      .catch((e) => {
        console.error(e);
        if (e.message.includes("reason: time")) {
          interaction.followUp({
            content: "PartyPlanner has timed out.",
            ephemeral: true,
          });
        }
      });

    // game_modal_response = new EmbedBuilder().addFields([
    //   {
    //     name: "Game Title",
    //     value: gameTitle,
    //   },
    //   {
    //     name: "Game Player Limit",
    //     value: gamePlayerLimit,
    //   },
    //   {
    //     name: "Game Cost",
    //     value: gameCost,
    //   },
    //   {
    //     name: "Game Available",
    //     value: gameAvailable,
    //   },
    // ]);
  },
};
