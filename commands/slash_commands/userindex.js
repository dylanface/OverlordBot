const {
  CommandInteraction,
  Client,
  ComponentType,
  ButtonStyle,
} = require("discord.js");
const {
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  EmbedBuilder,
} = require("@discordjs/builders");
const { PermissionFlagsBits } = require("discord-api-types/v10");

module.exports = {
  enabled: true,
  name: "userindex",
  description: "Search all of Discord for a user",
  options: [
    {
      name: "userid",
      type: "USER",
      description: "The user's userid (in snowflake form)",
      required: true,
    },
    {
      name: "reason",
      type: "STRING",
      description: "Reason for banning the user, if any",
      required: false,
    },
  ],
  data: new SlashCommandBuilder()
    .setName("userindex")
    .setDescription("Search all of Discord for a user")
    .addUserOption((option) =>
      option
        .setName("userid")
        .setDescription("The user's userid (in snowflake form)")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for banning the user, if any")
        .setRequired(false)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  /**
   * @param { CommandInteraction } interaction The command interaction object.
   * @param { Client } client The discord client that called this command.
   */
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });

    const { id: inputId } = interaction.options.getUser("userid");
    if (interaction.options.getString("reason")) {
      var inputReason = interaction.options.getString("reason");
    }

    const banEmoji = "🔨";
    const cancelEmoji = "❌";

    const cancelButtonPr = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel(`${cancelEmoji} Cancel`)
      .setStyle(ButtonStyle.Secondary);

    const banButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("banuser")
        .setLabel(`${banEmoji} Ban User`)
        .setStyle(ButtonStyle.Primary),
      cancelButtonPr
    );

    const banConfirm = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("redbanuser")
        .setLabel(`${banEmoji} Are You Sure?`)
        .setStyle(ButtonStyle.Danger),
      cancelButtonPr
    );

    async function registerInteraction(event) {
      await client.ModerationLogger.publish(interaction.guild, event);
    }

    try {
      var user = await client.users.fetch(inputId, true);

      const userInfo = new EmbedBuilder()
        .setColor(0xf6c5f8)
        .setAuthor({
          name: `${user.tag}`,
          iconURL: user.displayAvatarURL({ dynamic: true }),
        })
        .addFields(
          { name: "Requested Id:", value: inputId },
          { name: "Fetched Id:", value: user.id },
          { name: "Account Creation Date:", value: user.createdAt.toString() }
        );

      await interaction.editReply({
        embeds: [userInfo],
        components: [banButton],
      });
      const channelId = interaction.channelId;
      const channel = await interaction.member.guild.channels.fetch(channelId);

      const filter = (i) =>
        i.user.id === interaction.user.id &&
        i.message.interaction.id === interaction.id;
      const collector = channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        idle: 45 * 1000,
      });

      collector.on("collect", async (interaction) => {
        if (!interaction.isButton()) return;
        else await interaction.deferUpdate({ ephemeral: true });

        switch (interaction.customId) {
          case "banuser":
            await interaction.editReply({ embeds: [userInfo], components: [] });
            await interaction.editReply({
              embeds: [userInfo],
              components: [banConfirm],
            });
            break;

          case "cancel":
            await interaction.editReply({
              content:
                "All actions canceled, the user has been added to the cache.",
              components: [],
              embeds: [],
            });
            collector.stop();

            break;

          case "redbanuser":
            if (!inputReason) {
              await interaction.guild.members
                .ban(inputId)
                .then(console.log)
                .catch(console.error);
            } else {
              await interaction.guild.members
                .ban(inputId, { reason: inputReason })
                .then(console.log)
                .catch(console.error);
            }

            // Then create a log
            registerInteraction({
              moderator: interaction.member,
              suspect: user,
              type: "banned",
              reason: inputReason,
            });
            collector.stop();
            await interaction.editReply({
              content: "userindex completed.",
              components: [],
              embeds: [],
            });

            break;
        }
      });

      collector.on("end", (collected) => {
        console.log(
          `The collecter has ended its collection round, and collected ${collected.size} items`
        );
      });
    } catch (error) {
      console.error(error);
    }
  },
};
