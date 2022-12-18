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

    const messageGuild = await client.guilds.fetch(newMessage.guildId);
    const messageLogsChannel = messageGuild.channels.cache.find(
      (channel) => channel.name === "message-logs"
    );
    if (!messageLogsChannel) return;

    const diffResult = compareMessages(
      newMessage.cleanContent,
      oldMessage.cleanContent
    );
    console.log(diffResult);

    const diffAmountRequired = 3;
    if (
      diffResult.lineCountDeleted + diffResult.lineCountInserted <
      diffAmountRequired
    ) {
      return;
    }

    const formattedInsertedLines = highlightInsertedLines(diffResult);
    const formattedDeletedLines = highlightDeletedLines(diffResult);

    const mobileLink = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Go To Message")
        .setStyle("Link")
        .setURL(
          `https://discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id}`
        )
    );

    const registryEmbedName =
      oldMessage.pinned || newMessage.pinned
        ? `${newMessage.author.tag} edited a pinned message in #${newMessage.channel.name}`
        : `${newMessage.author.tag} edited a message in #${newMessage.channel.name}`;

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
  const newMessageArray = newMessage.split("");
  const oldMessageArray = oldMessage.split("");

  const diff = patienceDiff(oldMessageArray, newMessageArray);

  return diff;
}

function highlightInsertedLines(diff) {
  let closeIndexGrouping = [];
  let lastLetter = {};
  let lineCountInsertedResult = [];

  for (let letterObject of diff.lines) {
    let letter = letterObject.line;

    //for letterObject.bIndex = 0 to diff.lines.size
    //  offset = 0
    //  if bIndex = aIndex + offset then normal word
    //  if aIndex = -1 then **word** and offset += 1
    // ?if bIndex -1 "moved" then gotta offset as well somehow..

    if (letterObject.bIndex !== -1) {
      if (
        letterObject.aIndex === -1 &&
        letterObject.bIndex - lastLetter.bIndex <= 2
      ) {
        // console.log("Adding to close index grouping: missing in old message");
        closeIndexGrouping.push(letter);
      } else if (letterObject.bIndex === 0 && letterObject.aIndex === -1) {
        // console.log("Adding to close index grouping: first letter");
        closeIndexGrouping.push(letter);
      } else if (
        (letterObject.aIndex - letterObject.bIndex > 8 ||
          letterObject.aIndex - letterObject.bIndex < -8) &&
        letterObject.aIndex !== -1
      ) {
        // console.log("Adding to close index grouping: large gap");
        closeIndexGrouping.push(letter);
      } else if (closeIndexGrouping.length > 0) {
        // console.log("Adding close index grouping: new letter is too far");
        lineCountInsertedResult.push(
          `**${closeIndexGrouping.join("")}**`,
          letter
        );
        closeIndexGrouping = [];
      } else {
        //console.log("Adding to results: unchanged letter");
        lineCountInsertedResult.push(letter);
      }
    }
    lastLetter = letterObject;
  }

  if (closeIndexGrouping.length > 0) {
    // console.log("Adding close index grouping: final close index grouping push");
    lineCountInsertedResult.push(`**${closeIndexGrouping.join("")}**`);
  }

  return lineCountInsertedResult.join("");
}

function highlightDeletedLines(diff) {
  let closeIndexGrouping = [];
  let lastLetter = {};
  let lineCountDeletedResult = [];

  for (let letterObject of diff.lines) {
    let letter = letterObject.line;

    //for letterObject.bIndex = 0 to diff.lines.size
    //  offset = 0
    //  if bIndex = aIndex + offset then normal word
    //  if aIndex = -1 then **word** and offset += 1
    // ?if bIndex -1 "moved" then gotta offset as well somehow..

    if (letterObject.aIndex !== -1) {
      if (
        letterObject.bIndex === -1 &&
        letterObject.aIndex - lastLetter.aIndex <= 2
      ) {
        // console.log("Adding to close index grouping: missing in old message");
        closeIndexGrouping.push(letter);
      } else if (letterObject.aIndex === 0 && letterObject.bIndex === -1) {
        // console.log("Adding to close index grouping: first letter");
        closeIndexGrouping.push(letter);
      } else if (
        (letterObject.bIndex - letterObject.aIndex > 8 ||
          letterObject.bIndex - letterObject.aIndex < -8) &&
        letterObject.bIndex !== -1
      ) {
        // console.log("Adding to close index grouping: large gap");
        closeIndexGrouping.push(letter);
      } else if (closeIndexGrouping.length > 0) {
        // console.log("Adding close index grouping: new letter is too far");
        lineCountDeletedResult.push(
          `**${closeIndexGrouping.join("")}**`,
          letter
        );
        closeIndexGrouping = [];
      } else {
        //console.log("Adding to results: unchanged letter");
        lineCountDeletedResult.push(letter);
      }
    }
    lastLetter = letterObject;
  }

  if (closeIndexGrouping.length > 0) {
    // console.log("Adding close index grouping: final close index grouping push");
    lineCountDeletedResult.push(`**${closeIndexGrouping.join("")}**`);
  }

  return lineCountDeletedResult.join("");
}
