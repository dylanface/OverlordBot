import { ModerationAction, OverlordSlashCommand } from "../../types/Overlord";

import {
  ComponentType,
  ButtonStyle,
  Guild,
  ButtonInteraction,
  TextInputBuilder,
  InteractionCollector,
} from "discord.js";
import {
  SlashCommandBuilder,
  ButtonBuilder,
  ActionRowBuilder,
  EmbedBuilder,
  ModalBuilder,
} from "@discordjs/builders";
import { PermissionFlagsBits, TextInputStyle } from "discord-api-types/v10";

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

    let inputReason: string = "No reason provided.";
    if (interaction.options.getString("reason")) {
      inputReason = interaction.options.getString("reason") as string;
    }

    const kickEmoji = "👢";
    const banEmoji = "🔨";
    const warnEmoji = "⚠️";
    // const cancelEmoji = "✖️";
    // const confirmEmoji = "✔️";

    const confirmActionButton = new ButtonBuilder()
      .setCustomId("confirm")
      .setLabel("Confirm")
      .setStyle(ButtonStyle.Success);

    const cancelButton = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Danger);

    const warnButton = new ButtonBuilder()
      .setCustomId(ModerationAction.Warn)
      .setLabel(`${warnEmoji} Warn User`)
      .setStyle(ButtonStyle.Primary);

    const kickButton = new ButtonBuilder()
      .setCustomId(ModerationAction.Kick)
      .setLabel(`${kickEmoji} Kick User`)
      .setStyle(ButtonStyle.Primary);

    const banButton = new ButtonBuilder()
      .setCustomId(ModerationAction.Ban)
      .setLabel(`${banEmoji} Ban User`)
      .setStyle(ButtonStyle.Primary);

    const promptActionRow = new ActionRowBuilder().addComponents(
      warnButton,
      kickButton,
      banButton,
      cancelButton
    );

    const confirmationActionRow = new ActionRowBuilder().addComponents(
      confirmActionButton,
      cancelButton
    );

    const sendTimeoutEmbed = () => {
      const embed = new EmbedBuilder()
        .setColor(0xff6961)
        .setTitle("The collector timed out.")
        .setDescription(
          "The action has been canceled and the user has been cached."
        );

      interaction.editReply({ embeds: [embed], components: [] });
    };

    const sendCanceledEmbed = () => {
      const embed = new EmbedBuilder()
        .setColor(0xff6961)
        .setTitle("The action was canceled.")
        .setDescription(
          "The action has been canceled and the user has been cached."
        );

      interaction.editReply({ embeds: [embed], components: [] });
    };

    async function registerInteraction(event: any) {
      if (!event) throw new Error("No event found.");
      const moderationInteractionEmbed = await client.ModerationLogger.publish(
        interaction.guild as Guild,
        event
      );

      if (!moderationInteractionEmbed)
        throw new Error("Moderation interaction embed could not be generated.");

      return moderationInteractionEmbed;
    }

    const user = await client.users.fetch(inputId, { cache: true });

    const generateUserInfoEmbed = (
      moderationAction?: ModerationAction
    ): EmbedBuilder => {
      const embed = new EmbedBuilder()
        .setColor(0xf6c5f8)
        .setThumbnail(user.displayAvatarURL())
        .addFields(
          { name: "Username:", value: user.tag, inline: true },
          { name: "User ID:", value: user.id, inline: true },
          { name: "Account Creation Date:", value: user.createdAt.toString() }
        );

      if (moderationAction === ModerationAction.Warn) {
        embed.setTitle("Are you sure you want to warn this user?");
        embed.setDescription(
          "The warning that will be sent to the user is posted below this embed."
        );
      } else if (moderationAction === ModerationAction.Kick)
        embed.setTitle("Are you sure you want to kick this user?");
      else if (moderationAction === ModerationAction.Ban)
        embed.setTitle("Are you sure you want to ban this user?");

      return embed;
    };

    const generateWarningEmbed = async (
      bInteraction: ButtonInteraction,
      promptCollector: InteractionCollector<ButtonInteraction>
    ) => {
      let warningMessage = `• You violated the rules of ${interaction.guild?.name}.\n\n• If you would like to view the rules, please visit the #rules channel.\n\n• If you would like to dispute this warning contact a moderator. Please note that if you choose to dispute this warning a second decision will be made by a moderator other than the one who issued this warning, their decision will be final and can not be disputed.`;

      const warningInfoInput = new TextInputBuilder()
        .setCustomId("message")
        .setLabel("Customize Warning Message")
        .setPlaceholder("Enter a warning message here.")
        .setValue(warningMessage)
        .setMinLength(1)
        .setMaxLength(350)
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);

      const reasonInput = new TextInputBuilder()
        .setCustomId("reason")
        .setLabel("Reason for Warning")
        .setPlaceholder("Enter a reason for warning this user.")
        .setValue(inputReason)
        .setMinLength(1)
        .setMaxLength(350)
        .setRequired(false)
        .setStyle(TextInputStyle.Paragraph);

      const warningInfoRow = new ActionRowBuilder().addComponents(
        warningInfoInput
      );
      const reasonRow = new ActionRowBuilder().addComponents(reasonInput);

      await bInteraction.showModal(
        new ModalBuilder()
          .setCustomId("warning")
          .setTitle("Warning Message")
          .addComponents(warningInfoRow, reasonRow as any)
      );

      await bInteraction
        .awaitModalSubmit({ time: 240 * 1000 })
        .then((i) => {
          if (i.isModalSubmit()) {
            warningMessage = i.fields.getTextInputValue("message");
            inputReason = i.fields.getTextInputValue("reason");
            i.deferUpdate();
            promptCollector.stop("selection made");
          }
        })
        .catch(() => {
          sendTimeoutEmbed();
          promptCollector.stop("time expired");
        });

      const warningEmbed = new EmbedBuilder()
        .setColor(0xfdfd96)
        .setTitle(
          `You have recieved a warning from ${interaction.guild?.name}.`
        )
        .setDescription(warningMessage)
        .addFields({ name: "Reason:", value: inputReason })
        .setFooter({
          text: `This is an automated message from ${interaction.guild?.name}.`,
        });

      return warningEmbed;
    };

    const getChannel = async () => {
      const channelId = interaction.channelId;
      const channel = await interaction.guild?.channels.fetch(channelId);
      if (!channel?.isTextBased()) throw new Error("Channel not found.");

      return channel;
    };

    const startCollector = async () => {
      const channel = await getChannel();
      const filter = (i: ButtonInteraction) =>
        i.user.id === interaction.user.id &&
        i.message.interaction?.id === interaction.id;
      const collector = channel.createMessageComponentCollector({
        filter,
        componentType: ComponentType.Button,
        idle: 60 * 1000,
      });

      return collector;
    };

    const handlePromptCollector = async () => {
      return new Promise(async (resolve, reject) => {
        const collector = await startCollector();
        collector.once("collect", async (i) => {
          if (!i.isButton()) return;
          else if (i.customId !== ModerationAction.Warn) await i.deferUpdate();
          console.log("Button pressed:", i.customId);

          switch (i.customId) {
            case ModerationAction.Warn:
              const warningEmbed = await generateWarningEmbed(i, collector);
              await i.editReply({
                embeds: [
                  generateUserInfoEmbed(ModerationAction.Warn),
                  warningEmbed,
                ],
                components: [confirmationActionRow as any],
              });
              await handleModerationAction(ModerationAction.Warn, warningEmbed);
              break;

            case ModerationAction.Kick:
              await i.editReply({
                embeds: [generateUserInfoEmbed(ModerationAction.Kick)],
                components: [confirmationActionRow as any],
              });
              await handleModerationAction(ModerationAction.Kick);
              collector.stop("selection made");
              break;

            case ModerationAction.Ban:
              await i.editReply({
                embeds: [generateUserInfoEmbed(ModerationAction.Ban)],
                components: [confirmationActionRow as any],
              });
              await handleModerationAction(ModerationAction.Ban);
              collector.stop("selection made");
              break;

            case "cancel":
              sendCanceledEmbed();
              collector.stop("actions canceled");
              break;

            default:
              throw new Error(
                `A button with the id ${i.customId} was not found.`
              );
          }
        });

        collector.once("end", async (collected, reason) => {
          if (reason === "idle") {
            reject("The collector timed out.");
          } else resolve(reason);
        });
      });
    };

    const handleConfirmationCollector = async (): Promise<boolean> => {
      return new Promise(async (resolve, reject) => {
        let confirmed = false;
        const collector = await startCollector();
        collector.once("collect", async (i) => {
          if (!i.isButton()) return;
          else await i.deferUpdate();
          console.log("Button pressed:", i.customId);

          if (i.customId === "confirm") confirmed = true;
          collector.stop("confirmed");
        });

        collector.once("end", async (collected, reason) => {
          if (reason === "idle") {
            reject("The collector timed out.");
          } else {
            resolve(confirmed);
          }
        });
      });
    };

    const handleModerationAction = async (
      moderationAction: ModerationAction,
      warningEmbed?: EmbedBuilder
    ) => {
      await handleConfirmationCollector()
        .then(async (confirmed) => {
          console.log("Confirmed:", confirmed);
          if (!confirmed) return sendCanceledEmbed();

          switch (moderationAction) {
            case ModerationAction.Ban:
              interaction.guild?.members.ban(user, {
                reason: inputReason ? inputReason : "No reason provided.",
              });
              interaction.editReply({
                embeds: [
                  (await registerInteraction({
                    moderator: interaction.member,
                    suspect: user,
                    type: "banned",
                    reason: inputReason,
                  })) as any,
                ],
                components: [],
              });
              break;

            case ModerationAction.Kick:
              interaction.guild?.members.kick(
                user,
                inputReason ? inputReason : "No reason provided."
              );
              interaction.editReply({
                embeds: [
                  (await registerInteraction({
                    moderator: interaction.member,
                    suspect: user,
                    type: "kicked",
                    reason: inputReason,
                  })) as any,
                ],
                components: [],
              });
              break;

            case ModerationAction.Warn:
              if (!warningEmbed)
                throw new Error("No warning embed given to handler.");
              user
                .createDM()
                .then(async (dm) => {
                  await dm.send({ embeds: [warningEmbed] });
                })
                .catch(async (err) => {
                  await interaction.editReply({
                    embeds: [
                      new EmbedBuilder()
                        .setTitle("Warning Failed to Send")
                        .setDescription(
                          "Overlord can not send a message to that user. The user must be in a mutual server with Overlord, and must have their DMs enabled."
                        ),
                    ],
                    components: [],
                  });
                });
              // Keep track of each users warnings in the database
              // register the interaction
              break;

            default:
              throw new Error("No moderation action found.");
          }
        })
        .catch(() => {
          sendTimeoutEmbed();
        });

      return;
    };

    await interaction.editReply({
      embeds: [generateUserInfoEmbed()],
      components: [promptActionRow as any],
    });
    await handlePromptCollector().catch((err) => {
      sendTimeoutEmbed();
    });
    return;
  },
};
