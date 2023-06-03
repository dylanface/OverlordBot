import {
  Collection,
  ComponentType,
  ButtonStyle,
  ModalSubmitInteraction,
  ChatInputCommandInteraction,
  StringSelectMenuInteraction,
  ButtonInteraction,
  Embed,
  Message,
} from "discord.js";
import {
  codeBlock,
  SlashCommandBuilder,
  ActionRowBuilder,
  SelectMenuBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ModalBuilder,
  TextInputBuilder,
} from "@discordjs/builders";
import { PermissionFlagsBits, TextInputStyle } from "discord-api-types/v10";
import { OverlordSlashCommand } from "../../types/Overlord";

export = <OverlordSlashCommand>{
  name: "massban",
  description: "Begin the mass ban process for a list of Users",
  options: [
    {
      name: "userlist",
      type: "STRING",
      description: "Comma separated user id list",
      required: true,
    },
  ],
  data: new SlashCommandBuilder()
    .setName("massban")
    .setDescription("Begin the mass ban process for a list of Users")
    .addStringOption((option) =>
      option
        .setName("userlist")
        .setDescription("Comma separated user id list")
        .setRequired(true)
    )
    .setDMPermission(false)
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
  async execute(client, interaction) {
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.guild)
      throw new Error("This command can only be used in a server.");

    const guild = interaction.guild;
    const channel = await interaction.guild.channels.fetch(
      interaction.channelId
    );
    if (!channel?.isTextBased())
      throw new Error("This command can only be used in a text channel.");

    const guildLogChannel = guild.channels.cache.find(
      (channel) => channel.name === "guild-logs"
    );
    if (!guildLogChannel) throw new Error("Guild log channel not found.");

    const inputUserList = interaction.options.getString("userlist");

    /**
     * Format the raw user list into an array of userObjects.
     */
    const formatUserList = async (userList: string) => {
      let replaceOp = userList.replace(/[^0-9,]/g, "");
      let userListArray = replaceOp.split(",");
      const filteredArray = userListArray.filter((user) => {
        return user.length >= 17 && user.length <= 20;
      });
      const returnArray = [];

      for (let userId of filteredArray) {
        const user = await client.users
          .fetch(userId, { cache: true })
          .catch(console.error);

        if (user) {
          returnArray.push({ id: user.id, user: user });
          continue;
        } else continue;
      }

      let formattedUserList = {
        userListArray: returnArray,
        userListLength: returnArray.length,
      };

      return formattedUserList;
    };

    // Generate the formatted user list array globally.
    const { userListArray, userListLength } = await formatUserList(
      inputUserList as string
    );

    // End the mass ban process if the user list includes less than 3 userObjects.
    if (userListLength <= 2)
      return await interaction.editReply(
        `Mass ban requires at least 3 suspected users.`
      );

    /**
     * Initiate the mass ban process using a modal.
     */
    const modalMassBan = async () => {
      const modal = new ModalBuilder()
        .setCustomId("massBanModal")
        .setTitle("Mass Ban Input");

      const idList = new TextInputBuilder()
        .setCustomId("idList")
        .setLabel("Copy and paste user list below.")
        .setStyle(TextInputStyle.Paragraph);

      const reasoning = new TextInputBuilder()
        .setCustomId("reasoning")
        .setLabel("What is your reasoning for this ban?")
        .setStyle(TextInputStyle.Paragraph);

      const firstActionRow = new ActionRowBuilder().addComponents(
        idList,
        reasoning
      );
      // const secondActionRow = new MessageActionRow().addComponents(reasoning);

      modal.addComponents(firstActionRow as any);

      await interaction.showModal(modal);

      const filter = (i: ModalSubmitInteraction) =>
        i.customId === "massBanModal";
      interaction
        .awaitModalSubmit({ filter, time: 15000 })
        .then(async (interaction) => {
          const idList = interaction.fields.getTextInputValue("idList");
          const reasoning = interaction.fields.getTextInputValue("reasoning");

          await interaction.reply(
            "You have submitted the following values: \n" +
              idList +
              "\n" +
              reasoning
          );
        })
        .catch(console.error);
    };

    /**
     * Send and watch the default reason selector to begin the mass ban process.
     * @param {CommandInteraction} interaction The command interaction that began this mass ban.
     */
    const establishDefaultReason = async (
      interaction: ChatInputCommandInteraction
    ) => {
      const reasonSelector = new ActionRowBuilder().addComponents(
        new SelectMenuBuilder()
          .setCustomId("massban_reason_selector")
          .setPlaceholder("Select a default reason for this operation")
          .addOptions([
            {
              label: "Banned by Streamer Friend",
              value: "Harassing a streamer",
            },
            {
              label: "Bots | Alternative Accounts",
              value: "Botting or avoiding punishments",
            },
            {
              label: "Hate Speech",
              value:
                "Discriminating against race, national origin, religious affiliation, gender or sexual orientation.",
            },
            {
              label: "Child Endangerment",
              value: "Harassing and/or endangering a minor using Discord",
            },
            {
              label: "Reason Not Specified",
              value: "null",
            },
          ])
      );

      const massBanEmbed = new EmbedBuilder()
        .setColor(0x099ff)
        .setTitle("Mass Ban")
        .setDescription(
          `Select default reason for banning (${userListLength}) users:`
        );

      await interaction.editReply({
        embeds: [massBanEmbed],
        components: [reasonSelector as any],
      });

      const defaultReasonFilter = (i: StringSelectMenuInteraction) =>
        i.customId === "massban_reason_selector" &&
        i.user.id === interaction.member?.user.id &&
        i.message.interaction?.id === interaction.id;

      const defaultReasonCollector = channel.createMessageComponentCollector({
        filter: defaultReasonFilter,
        componentType: ComponentType.StringSelect,
        idle: 120 * 1000,
      });

      defaultReasonCollector.on("collect", async (interaction) => {
        console.log("default reason selected");
        if (!interaction.isStringSelectMenu()) return;
        else await interaction.deferUpdate();

        createUserList(interaction, interaction.values[0]).catch(console.error);
        defaultReasonCollector.stop();
      });
    };

    /**
     * A collection of embeds generated for the user list.
     */
    const userListGeneratedEmbeds: Collection<string, EmbedBuilder> =
      new Collection();

    /**
     * Turn an object from the user list and a reason into an embed.
     * @param userObject The object passed from the user list.
     * @param reason The reason for the ban.
     */
    const createUserEmbed = async (userObject: any, reason: string) => {
      const user = userObject.user;
      if (reason === "pardon") {
        const userPardonEmbed = new EmbedBuilder()
          .setColor(user.accentColor)
          .setAuthor({
            name: `${user.tag}`,
            iconURL: user.displayAvatarURL({ dynamic: true }),
          })
          .setDescription(
            `${user.tag} is currently pardoned from this ban list. Edit reason, or click Pardon User again to re-add.`
          );
        userListGeneratedEmbeds.set(userObject.id, userPardonEmbed);
      } else {
        const userEmbed = new EmbedBuilder()
          .setColor(user.accentColor)
          .setAuthor({
            name: `${user.tag}`,
            iconURL: user.displayAvatarURL({ dynamic: true }),
          })
          .addFields(
            { name: "User Id", value: `${user.id}`, inline: true },
            {
              name: "Discord Bot",
              value: `${
                user.bot
                  ? "This user is registered as a bot"
                  : "This user is not a registered bot"
              }`,
              inline: true,
            },
            { name: "Reason", value: `${reason}`, inline: false },
            {
              name: "Account Created",
              value: `${user.createdAt}`,
              inline: true,
            },
            {
              name: "Account Age",
              value: `${Math.floor(
                (Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)
              )} days`,
              inline: true,
            }
          );

        userListGeneratedEmbeds.set(userObject.id, userEmbed);
      }
    };

    /**
     * Create action row for operation summary confirmation.
     */
    const confirmActionRow = () => {
      const confirmationButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId("confirm_button")
          .setLabel("Confirm")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId("cancel_button")
          .setLabel("Cancel")
          .setStyle(ButtonStyle.Danger)
      );

      return confirmationButtons;
    };

    /**
     * Listener for operation summary confirmation.
     * @param {Collection} operations The operations of interest.
     */
    const listenForConfirmation = async (operations: Collection<any, any>) => {
      const confirmationFilter = (i: ButtonInteraction) =>
        i.user.id === interaction.user.id &&
        i.message.interaction?.id === interaction.id;
      const userActionButtonCollector = channel.createMessageComponentCollector(
        {
          filter: confirmationFilter,
          componentType: ComponentType.Button,
          idle: 45 * 1000,
        }
      );

      userActionButtonCollector.on("collect", async (interaction) => {
        if (!interaction.isButton()) return;
        else await interaction.deferUpdate();

        if (interaction.customId === "confirm_button") {
          await executeBanList(operations);
          userActionButtonCollector.stop();

          const confirmationEmbed = new EmbedBuilder()
            .setColor(0x099ff)
            .setDescription(
              `Actions are being executed... Check <#${guildLogChannel.id}> for logs.`
            );

          await interaction.editReply({
            embeds: [confirmationEmbed],
            components: [],
          });
        }
        if (interaction.customId === "cancel_button") {
          userActionButtonCollector.stop();

          const cancelEmbed = new EmbedBuilder()
            .setColor(0xff0000)
            .setDescription(
              "Cancelled mass ban operation, no action(s) will be executed."
            );

          await interaction.editReply({
            embeds: [cancelEmbed],
            components: [],
          });

          // client.openMassBan = false;
        }
      });
    };

    /**
     * Execute the bans as detailed in the operations collection.
     * @param {Collection} operations The operations collection to execute.
     */
    const executeBanList = async (operations: Collection<any, any>) => {
      const bannedUsers: Array<any> = [];
      for (let [key, value] of operations) {
        if (value != "pardon") {
          if (value === "null")
            value = `Banned by ${interaction.user.tag} with mass ban`;

          await guild.members
            .ban(key, { reason: value })
            .then((k) => {
              bannedUsers.push(k);
            })
            .catch(console.error);
        }
      }

      const event = {
        type: "mass-ban",
        suspectId: null,
        moderator: interaction.member,
        suspects: bannedUsers,
        reason: `Banned by ${interaction.user.tag} with mass ban`,
      };

      await client.ModerationLogger.publish(guild, event);

      return bannedUsers;
    };

    /**
     * Create the action row for the user list.
     * @param backDisabled True if the back button should be disabled.
     * @param nextDisabled True if the next button should be disabled.
     */
    const createActionRow = (backDisabled: boolean, nextDisabled: boolean) => {
      const backButton = new ButtonBuilder()
        .setCustomId("back")
        .setLabel("Back")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(backDisabled);

      const nextButton = new ButtonBuilder()
        .setCustomId("next")
        .setLabel(`Next`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(nextDisabled);

      const userListActionButtons = new ActionRowBuilder().addComponents(
        backButton,
        nextButton,
        new ButtonBuilder()
          .setCustomId("pardon")
          .setLabel(`Pardon User`)
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId("edit_reason")
          .setLabel(`Edit Reason for User`)
          .setStyle(ButtonStyle.Danger),
        new ButtonBuilder()
          .setCustomId("continue")
          .setLabel(`Continue to review`)
          .setStyle(ButtonStyle.Success)
      );

      return userListActionButtons;
    };

    /**
     * Create and watch the embeds for the user list.
     * @param { SelectMenuInteraction } interaction The select menu interaction that called this function.
     * @param { String | null } reason The default reason to apply to this user list.
     */
    const createUserList = async (
      interaction: StringSelectMenuInteraction,
      reason: string
    ) => {
      const userListOperations = new Collection();

      for (let user of userListArray) {
        await createUserEmbed(user, reason);
      }

      const userListEmbed = userListGeneratedEmbeds.get(userListArray[0].id);

      interaction.editReply({
        embeds: [userListEmbed as EmbedBuilder],
        components: [createActionRow(true, false) as any],
      });

      let iterator = 0;

      const userActionButtonFilter = (i: ButtonInteraction) =>
        i.user.id === interaction.user.id &&
        i.message.interaction?.id === interaction.message.interaction?.id;
      const userActionButtonCollector = channel.createMessageComponentCollector(
        {
          filter: userActionButtonFilter,
          componentType: ComponentType.Button,
          idle: 60 * 1000,
        }
      );

      userActionButtonCollector.on("collect", async (interaction) => {
        if (!interaction.isButton()) return;
        else await interaction.deferUpdate();

        switch (interaction.customId) {
          case "back":
            if (iterator > 1) {
              const embed = userListGeneratedEmbeds.get(
                userListArray[--iterator].id
              );
              interaction.editReply({
                embeds: [embed as EmbedBuilder],
                components: [createActionRow(false, false) as any],
              });
            } else {
              const embed = userListGeneratedEmbeds.get(
                userListArray[--iterator].id
              );
              interaction.editReply({
                embeds: [embed as EmbedBuilder],
                components: [createActionRow(true, false)] as any,
              });
            }
            break;

          case "next":
            if (iterator < userListArray.length - 1 - 1) {
              const embed = userListGeneratedEmbeds.get(
                userListArray[++iterator].id
              );
              interaction.editReply({
                embeds: [embed as EmbedBuilder],
                components: [createActionRow(false, false) as any],
              });
            } else {
              const embed = userListGeneratedEmbeds.get(
                userListArray[++iterator].id
              );
              interaction.editReply({
                embeds: [embed as EmbedBuilder],
                components: [createActionRow(false, true) as any],
              });
            }
            break;

          case "pardon":
            if (
              userListOperations.get(userListArray[iterator].id) === "pardon"
            ) {
              await createUserEmbed(userListArray[iterator], reason).then(
                () => {
                  const embed = userListGeneratedEmbeds.get(
                    userListArray[iterator].id
                  );
                  interaction.editReply({ embeds: [embed as EmbedBuilder] });
                  userListOperations.set(userListArray[iterator].id, reason);
                }
              );
            } else {
              await createUserEmbed(userListArray[iterator], "pardon").then(
                () => {
                  const embed = userListGeneratedEmbeds.get(
                    userListArray[iterator].id
                  );
                  interaction.editReply({ embeds: [embed as EmbedBuilder] });
                  userListOperations.set(userListArray[iterator].id, "pardon");
                }
              );
            }
            break;

          case "edit_reason":
            interaction
              .followUp({
                embeds: [
                  new EmbedBuilder().setDescription(
                    "Enter new reason for banning:"
                  ),
                ],
              })
              .then((prompt) => {
                const filter = (message: Message) =>
                  message.author.id === interaction.user.id;
                interaction.channel
                  ?.awaitMessages({
                    filter,
                    max: 1,
                    time: 30000,
                    errors: ["time"],
                  })
                  .then(async (collected) => {
                    await createUserEmbed(
                      userListArray[iterator],
                      collected.first()?.content as string
                    ).then(() => {
                      const embed = userListGeneratedEmbeds.get(
                        userListArray[iterator].id
                      );
                      interaction.editReply({
                        embeds: [embed as EmbedBuilder],
                      });
                      userListOperations.set(
                        userListArray[iterator].id,
                        collected.first()?.content
                      );
                      prompt.delete();
                      collected.first()?.delete();
                    });
                  })
                  .catch((collected) => {
                    console.log(`There has been a an error while editing`);
                  });
              });
            break;

          case "continue":
            for (let user of userListArray) {
              if (userListOperations.has(user.id)) {
                continue;
              } else {
                userListOperations.set(user.id, reason);
              }
            }
            interaction.editReply({
              embeds: [createOperationSummary(userListOperations, reason)],
              components: [confirmActionRow() as any],
            });
            userActionButtonCollector.stop();
            listenForConfirmation(userListOperations);
            break;
        }
      });
    };

    /**
     * Turn the operation collection into an summary embed
     * @param operations The operation collection to transform
     * @param reason The default reason to apply to this user list.
     */
    const createOperationSummary = (
      operations: Collection<any, any>,
      reason: string
    ) => {
      const operationSummaryEmbed = new EmbedBuilder()
        .setAuthor({
          name: `Operation Summary`,
          iconURL: client.user?.displayAvatarURL(),
        })
        .setDescription(
          codeBlock(
            "",
            `Default Reason Selected: ${reason}\nUsers to be banned: ${
              operations.filter((i) => i != "pardon").size
            }\nUsers to be pardoned: ${
              operations.filter((i) => i === "pardon").size
            }`
          )
        );

      return operationSummaryEmbed;
    };

    // Call the reason function to embed the reason selector and information
    establishDefaultReason(interaction);
  },
};
