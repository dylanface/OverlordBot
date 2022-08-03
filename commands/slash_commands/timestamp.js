const { CommandInteraction, Client, TextInputStyle } = require("discord.js");
const { ActionRowBuilder, SlashCommandBuilder, ModalBuilder, TextInputBuilder, codeBlock } = require("@discordjs/builders");
const { DateTime } = require("luxon");

module.exports = {
  enabled: true,
  name: "timestamp",
  description: "Get a formatted timestamp to paste in Discord messages.",
  data: new SlashCommandBuilder()
    .setName("timestamp")
    .setDescription("Get a formatted timestamp to paste in Discord messages.")
    .addStringOption((option) =>
      option
        .setName("timezone")
        .setDescription("Enter your timezone:")
        .setAutocomplete(true)
    ),
  /**
   * @param { CommandInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    const timezone = interaction.options.getString("timezone");

    const timezoneNow = DateTime.now().setZone(timezone);
    let date = timezoneNow.toFormat("yyyy-MM-dd");
    let time = timezoneNow.toFormat("HH:mm:ss");

    const inputModal = new ModalBuilder()
        .setCustomId("datetime_input")
        .setTitle("Date / Time Input");

    const dateInput = new TextInputBuilder()
        .setCustomId('dateInput')
        .setLabel("Date (YYYY-MM-DD)")
        .setStyle(TextInputStyle.Short)
        .setValue(date)
        .setMaxLength(10)
        .setMinLength(10);

    const timeInput = new TextInputBuilder()
      .setCustomId("timeInput")
      .setLabel("Local Time 24HR (HH:MM:SS)")
      .setStyle(TextInputStyle.Short)
      .setValue(time)
      .setMaxLength(8)
      .setMinLength(8);
        
	const actionRow1 = new ActionRowBuilder().addComponents(dateInput);
	const actionRow2 = new ActionRowBuilder().addComponents(timeInput);

    inputModal.addComponents(actionRow1, actionRow2);
        
    await interaction.showModal(inputModal);

    const filter = (i) => i.customId === "datetime_input";
    interaction
      .awaitModalSubmit({ filter, time: 30000 })
      .then(async (i) => {
        date = i.fields.getTextInputValue("dateInput");
        time = i.fields.getTextInputValue("timeInput");

        const combined = `${date}T${time} ${timezone}`;

        const dateTime = DateTime.fromFormat(
          combined,
          "yyyy-MM-dd'T'HH:mm:ss z"
        );

        const wantedSecs = dateTime.toSeconds().toString();

        await i.reply(
        {
            content: codeBlock(`Short Date -> <t:${wantedSecs}:d>\nLong Date -> <t:${wantedSecs}:D>\nShort Time -> <t:${wantedSecs}:t>\nLong Time -> <t:${wantedSecs}:T>\nShort Full DateTime -> <t:${wantedSecs}:f>\nLong Full DateTime -> <t:${wantedSecs}:F>\nRelative -> <t:${wantedSecs}:R>`),
            ephemeral: true
        }
        );
      })
      .catch((e) => {
        console.error(e);
        if (e.message.includes('reason: time')) {
            interaction.followUp({ content: "Modal has timed out.", ephemeral: true});
        }

    });
  },
};
