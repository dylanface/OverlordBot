import { OverlordSlashCommand } from "../../types/Overlord";

import {
  ComponentType,
  ButtonStyle,
  Guild,
  ButtonInteraction,
} from "discord.js";
import {
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  EmbedBuilder,
} from "@discordjs/builders";
import { PermissionFlagsBits } from "discord-api-types/v10";

export = <OverlordSlashCommand>{
  name: "index",
  enabled: true,
  config: {},
  data: new SlashCommandBuilder()
    .setName("index")
    .setDescription("Search all of Discord for a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user's user id (in snowflake form).")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("reason")
        .setDescription("Reason for banning the user, if any.")
        .setRequired(false)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.guild || interaction.guild === null)
      throw new Error("Guild not found, please contact support.");

    const inputUser = interaction.options.getUser("user");
    if (!inputUser) return interaction.editReply("No user input found.");
    const inputId = inputUser.id;

    let inputReason: string = "";
    if (interaction.options.getString("reason")) {
      inputReason = interaction.options.getString("reason") as string;
    }

    const banEmoji = "🔨";
    const cancelEmoji = "❌";
    const kickEmoji = "👢";

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel(`${cancelEmoji} Cancel`)
      .setStyle(ButtonStyle.Secondary);

    const kickButton = new ButtonBuilder()
      .setCustomId("kickuser")
      .setLabel(`${kickEmoji} Kick User`)
      .setStyle(ButtonStyle.Primary);

    const banButton = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("banuser")
        .setLabel(`${banEmoji} Ban User`)
        .setStyle(ButtonStyle.Primary),
      cancelButton
    );

    const banConfirm = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("redbanuser")
        .setLabel(`${banEmoji} Are You Sure?`)
        .setStyle(ButtonStyle.Danger),
      cancelButton
    );

    async function registerInteraction(event: any) {
      if (!event) return console.error("No event found.");
      await client.ModerationLogger.publish(interaction.guild as Guild, event);
    }

    const user = await client.users.fetch(inputId, { cache: true });

    const userInfo = new EmbedBuilder()
      .setColor(0xf6c5f8)
      .setAuthor({
        name: `${user.tag}`,
        iconURL: user.displayAvatarURL(),
      })
      .addFields(
        { name: "Requested Id:", value: inputId },
        { name: "Fetched Id:", value: user.id },
        { name: "Account Creation Date:", value: user.createdAt.toString() }
      );

    await interaction.editReply({
      embeds: [userInfo],
      components: [banButton as any],
    });

    const channelId = interaction.channelId;
    const channel = await interaction.guild.channels.fetch(channelId);
    if (!channel?.isTextBased()) throw new Error("Channel not found.");

    const filter = (i: ButtonInteraction) =>
      i.user.id === interaction.user.id &&
      i.message.interaction?.id === interaction.id;
    const collector = channel.createMessageComponentCollector({
      filter,
      componentType: ComponentType.Button,
      idle: 45 * 1000,
    });

    collector.on("collect", async (i) => {
      if (!i.isButton()) return;
      else await i.deferUpdate();

      switch (i.customId) {
        case "banuser":
          await i.editReply({ embeds: [userInfo], components: [] });
          await i.editReply({
            embeds: [userInfo],
            components: [banConfirm as any],
          });
          break;

        case "cancel":
          await i.editReply({
            content:
              "All actions canceled, the user has been added to the cache.",
            components: [],
            embeds: [],
          });
          collector.stop();
          break;

        case "redbanuser":
          if (!inputReason) {
            await interaction.guild?.members
              .ban(inputId)
              .then(console.log)
              .catch(console.error);
          } else {
            await interaction.guild?.members
              .ban(inputId, { reason: inputReason })
              .then(console.log)
              .catch(console.error);
          }
          // Then create a log
          registerInteraction({
            moderator: i.member,
            suspect: user,
            type: "banned",
            reason: inputReason,
          });
          collector.stop();
          await i.editReply({
            content: "userindex completed.",
            components: [],
            embeds: [],
          });
          break;

        default:
          throw new Error(`A button with the id ${i.customId} was not found.`);
          break;
      }
    });

    // collector.on("end", (collected) => {
    //   console.log(
    //     `The collecter has ended its collection round, and collected ${collected.size} items`
    //   );
    // });
  },
};
