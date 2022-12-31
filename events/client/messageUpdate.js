const { ButtonBuilder } = require("discord.js");
const { ActionRowBuilder, EmbedBuilder } = require("@discordjs/builders");

const { patienceDiff, patienceDiffPlus } = require("../../util/PatienceDiff");

module.exports = {
  name: "messageUpdate",
  async execute(oldMessage, newMessage, client) {
    // console.log("Message Edited: ", oldMessage, newMessage);
    if (oldMessage.hasThread)
      return console.log("MessageUpdate: Message has thread");
    if (!oldMessage.author) return console.log("MessageUpdate: No author");
    if (oldMessage.author.bot)
      return console.log("MessageUpdate: Author is bot");
    if (oldMessage.content.length >= 1024)
      return console.log("MessageUpdate: Message exceeds 1024 characters");
    if (oldMessage.content.length === 0 || newMessage.content.length === 0)
      return console.log("MessageUpdate: Message has no content");
    if (oldMessage.pinned !== newMessage.pinned) return;
    if (newMessage.embeds[0] || oldMessage.embeds[0]) {
      // Check messages because of embed
      if (oldMessage.toString() === newMessage.toString()) return;
    }

    // Find the guild and message-logs channel.
    try {
      var messageGuild = await client.guilds.fetch(newMessage.guildId);
    } catch (err) {
      console.error(err);
      return;
    }
    let messageLogsChannel = messageGuild.channels.cache.find(
      (channel) => channel.name === "message-logs"
    );
    // If the message-logs channel does not exist then return.
    if (!messageLogsChannel) {
      console.error("message-logs channel does not exist");
      return;
    }

    // Get the guild settings needed for a message edit event.
    const guildSettings = await client.GuildSettingsManager.fetch(
      messageGuild.id
    ).catch((err) => {
      console.error(err);
      return;
    });
    const editLogSettings = guildSettings.editLogs;
    const messageDiffSettings = editLogSettings.messageDiff;
    const messageRegexSettings = editLogSettings.regex;

    // Initial checks to see if the message edit should be logged or the message-logs channel should be overwritten.
    if (!editLogSettings.enabled) return;
    if (
      editLogSettings.channelId !== null &&
      editLogSettings.channelId !== messageLogsChannel.id
    ) {
      messageLogsChannel = await client.channels
        .fetch(editLogSettings.channelId)
        .catch((err) => {
          console.error(err);
          return;
        });
    }

    // Check if the message meets regex requirements.
    // If not then return and do not log the edit or run MessageDiff.
    if (messageRegexSettings.enabled) {
      let regexChecks = [];
      if (messageRegexSettings.forcePatterns.length > 0) {
        regexChecks = messageRegexSettings.forcePatterns;
      }

      let regexCheck = true;
      for (let regex of regexChecks) {
        if (regex.test(newMessage.content)) {
          regexCheck = true;
          break;
        }
      }
      if (!regexCheck) return;
    }

    // // Check if the message author has any of the exempt roles.
    // // If so then return and do not log the edit or run MessageDiff.
    // const exemptRoles = [
    //   "869137600282259474", // Dev (Testing Guild)
    // ];
    // try {
    //   const guildMember = await messageGuild.members.fetch(newMessage.author);
    //   if (guildMember.roles.cache.some((role) => exemptRoles.includes(role.id)))
    //     return;
    // } catch (error) {
    //   console.error(
    //     "GuildMember could not be fetched or their roles could not be parsed",
    //     error
    //   );
    // }

    // Check if PatienceDiff is enabled and initialize the formatted lines.
    let formattedInsertedLines = newMessage.cleanContent;
    let formattedDeletedLines = oldMessage.cleanContent;
    if (messageDiffSettings.enabled) {
      // Run the PatienceDiff algorithm to compare the old and new message.
      const diffResult = compareMessages(
        newMessage.cleanContent,
        oldMessage.cleanContent
      );
      // console.log(diffResult);

      // If the PatienceDiff reflects less than this amount of words changed then return.
      const diffAmountRequired = messageDiffSettings.characters;
      if (
        diffResult.lineCountDeleted + diffResult.lineCountInserted <
        diffAmountRequired
      ) {
        return;
      }

      // Format the PatienceDiff results into a string with boldened letters.
      formattedInsertedLines = highlightInsertedLines(diffResult);
      formattedDeletedLines = highlightDeletedLines(diffResult);
    }

    // Create the jump to message button for mobile users.
    const mobileLink = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Go To Message")
        .setStyle("Link")
        .setURL(
          `https://discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id}`
        )
    );

    // Format the embed name based on if the message is pinned or not.
    const registryEmbedName =
      oldMessage.pinned || newMessage.pinned
        ? `${newMessage.author.tag} edited a pinned message in #${newMessage.channel.name}`
        : `${newMessage.author.tag} edited a message in #${newMessage.channel.name}`;

    // Create the embed and send it to the message-logs channel.
    const registryEmbed = new EmbedBuilder()
      .setAuthor({
        name: registryEmbedName,
        iconURL: newMessage.author.displayAvatarURL({ dynamic: true }),
        url: `https://discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id}`,
      })
      .setTimestamp()
      .setColor(0x887d91)
      .addFields(
        { name: "Original Message:", value: formattedDeletedLines },
        { name: "New Message:", value: formattedInsertedLines }
      );

    await messageLogsChannel
      .send({ embeds: [registryEmbed], components: [mobileLink] })
      .catch((error) => messageLogsChannel.send({ content: error.toString() }));
  },
};

/**
 * Run a PatienceDiffPlus algorithm to compare two plain text messages.
 * @param {String} newMessage The old message.
 * @param {String} oldMessage The new message.
 */
function compareMessages(newMessage, oldMessage) {
  const newMessageArray = newMessage.split(" ");
  const oldMessageArray = oldMessage.split(" ");

  const diff = patienceDiff(oldMessageArray, newMessageArray);

  return diff;
}

/**
 * Highlight inserted letters from PatienceDiff algorithm.
 */
function highlightInsertedLines(diff) {
  let closeIndexGrouping = [];
  let lastLetter = {};
  let lineCountInsertedResult = [];

  for (let letterObject of diff.lines) {
    let word = letterObject.line;

    if (letterObject.bIndex !== -1) {
      if (
        letterObject.aIndex === -1
        // &&
        // letterObject.bIndex - lastLetter.bIndex <= 3
      ) {
        // console.log("Adding to close index grouping: missing in old message");
        closeIndexGrouping.push(word);
      } else if (letterObject.bIndex === 0 && letterObject.aIndex === -1) {
        // console.log("Adding to close index grouping: first letter");
        closeIndexGrouping.push(word);
      } else if (
        (letterObject.aIndex - letterObject.bIndex > 8 ||
          letterObject.aIndex - letterObject.bIndex < -8) &&
        letterObject.aIndex !== -1
      ) {
        // console.log("Adding to close index grouping: large gap");
        closeIndexGrouping.push(word);
      } else if (closeIndexGrouping.length > 0) {
        // console.log("Adding close index grouping: new letter is too far");
        lineCountInsertedResult.push(
          `**${closeIndexGrouping.join(" ")}**`,
          word
        );
        closeIndexGrouping = [];
      } else {
        //console.log("Adding to results: unchanged letter");
        lineCountInsertedResult.push(word);
      }
    }
    lastLetter = letterObject;
  }

  if (closeIndexGrouping.length > 0) {
    // console.log("Adding close index grouping: final close index grouping push");
    lineCountInsertedResult.push(`**${closeIndexGrouping.join(" ")}**`);
  }

  return lineCountInsertedResult.join(" ");
}

/**
 * Highlight deleted letters from PatienceDiff algorithm.
 */
function highlightDeletedLines(diff) {
  let closeIndexGrouping = [];
  let lastLetter = {};
  let lineCountDeletedResult = [];

  for (let letterObject of diff.lines) {
    let word = letterObject.line;

    if (letterObject.aIndex !== -1) {
      if (
        letterObject.bIndex === -1
        // &&
        // letterObject.aIndex - lastLetter.aIndex <= 3
      ) {
        // console.log("Adding to close index grouping: missing in old message");
        closeIndexGrouping.push(word);
      } else if (letterObject.aIndex === 0 && letterObject.bIndex === -1) {
        // console.log("Adding to close index grouping: first letter");
        closeIndexGrouping.push(word);
      } else if (
        (letterObject.bIndex - letterObject.aIndex > 8 ||
          letterObject.bIndex - letterObject.aIndex < -8) &&
        letterObject.bIndex !== -1
      ) {
        // console.log("Adding to close index grouping: large gap");
        closeIndexGrouping.push(word);
      } else if (closeIndexGrouping.length > 0) {
        // console.log("Adding close index grouping: new letter is too far");
        lineCountDeletedResult.push(
          `**${closeIndexGrouping.join(" ")}**`,
          word
        );
        closeIndexGrouping = [];
      } else {
        //console.log("Adding to results: unchanged letter");
        lineCountDeletedResult.push(word);
      }
    }
    lastLetter = letterObject;
  }

  if (closeIndexGrouping.length > 0) {
    // console.log("Adding close index grouping: final close index grouping push");
    lineCountDeletedResult.push(`**${closeIndexGrouping.join(" ")}**`);
  }

  return lineCountDeletedResult.join(" ");
}
