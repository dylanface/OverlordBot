const { CommandInteraction, Client } = require("discord.js");
const {
  SlashCommandSubcommandBuilder,
  SlashCommandStringOption,
} = require("@discordjs/builders");

const { DateTime } = require("luxon");

module.exports = {
  enabled: true,
  name: "time",
  data: new SlashCommandSubcommandBuilder()
    .setName("time")
    .setDescription("What time is it?")
    .addStringOption(
      new SlashCommandStringOption()
        .setName("timezone")
        .setDescription("In timezone (optional):")
        .setAutocomplete(true)
    ),
  /**
   * @param { CommandInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    await interaction.deferReply();

    let timezone = interaction.options.getString("timezone");
    if (!timezone) {
      const profile = await client.UserProfileManager.getProfile(
        interaction.user.id
      );

      timezone = profile.timezone;
    }

    const timezoneNow = DateTime.now().setZone(timezone);
    timezoneNow.c.day;

    const splitDay = timezoneNow.c.day.toString().split("");
    const lastDigitOfDay = splitDay[splitDay.length - 1];

    switch (lastDigitOfDay) {
      case "1":
        splitDay.push("st");
        break;

      case "2":
        splitDay.push("nd");
        break;

      case "3":
        splitDay.push("rd");
        break;

      default:
        splitDay.push("th");
        break;
    }

    const formattedTime = timezoneNow.toFormat(
      `MMM '${splitDay.join("")}' yyyy '-' h:mm:ss a 'in' ZZZZZ`
    );

    await interaction.editReply(`The current time is ${formattedTime}.`);
  },
};
