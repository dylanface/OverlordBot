const { ButtonBuilder } = require("discord.js");
const { ActionRowBuilder, EmbedBuilder } = require("@discordjs/builders");

const { patienceDiff } = require("../../util/PatienceDiff");

module.exports = {
  name: "messageUpdate",
  async execute(oldMessage, newMessage, client) {
    if (oldMessage.hasThread)
      return console.log("MessageUpdate: Message has thread");
    if (!oldMessage.author) return console.log("MessageUpdate: No author");
    if (oldMessage.author.bot)
      return console.log("MessageUpdate: Author is bot");
    if (oldMessage.content.length >= 1024)
      return console.log("MessageUpdate: Message exceeds 1024 characters");
    if (oldMessage.content.length === 0 || newMessage.content.length === 0)
      return console.log("MessageUpdate: Message has no content");
    if (newMessage.embeds[0] || oldMessage.embeds[0]) {
      // Check messages because of embed
      if (oldMessage.toString() === newMessage.toString()) return;
    }
    if (
      oldMessage.content.includes("overlord-ignore") ||
      newMessage.content.includes("overlord-ignore")
    ) {
      return console.log("MessageUpdate: Message contains overlord-ignore");
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

    const derivedNewText = formatHighlightEdits(diffResult);

    const mobileLink = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Go To Message")
        .setStyle("Link")
        .setURL(
          `https://discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id}`
        )
    );

    const registryEmbed = new EmbedBuilder()
      .setAuthor({
        name: `${newMessage.author.tag} edited a message in #${newMessage.channel.name}`,
        iconURL: newMessage.author.displayAvatarURL({ dynamic: true }),
        url: `https://discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id}`,
      })
      .setTimestamp()
      .setColor(0x887d91)
      .addFields(
        { name: "Original Message:", value: oldMessage.toString() },
        { name: "New Message:", value: derivedNewText }
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

  const diff = patienceDiff(newMessageArray, oldMessageArray);

  return diff;
}

function formatHighlightEdits(diff) {
  let closeIndexGrouping = [];
  let lastLetter = {};
  let newResult = [];

  for (let letterObject of diff.lines) {
    let letter = letterObject.line;

    if (letterObject.aIndex !== -1) {
      if (
        letterObject.bIndex === -1 &&
        letterObject.aIndex - lastLetter.aIndex <= 2
      ) {
        console.log("Adding to close index grouping: missing in old message");
        closeIndexGrouping.push(letter);
      } else if (letterObject.aIndex === 0 && letterObject.bIndex === -1) {
        console.log("Adding to close index grouping: first letter");
        closeIndexGrouping.push(letter);
      } else if (
        (letterObject.bIndex - letterObject.aIndex > 8 ||
          letterObject.bIndex - letterObject.aIndex < -8) &&
        letterObject.bIndex !== -1
      ) {
        console.log("Adding to close index grouping: large gap");
        closeIndexGrouping.push(letter);
      } else if (closeIndexGrouping.length > 0) {
        console.log("Adding close index grouping: new letter is too far");
        newResult.push(`**${closeIndexGrouping.join("")}**`, letter);
        closeIndexGrouping = [];
      } else {
        console.log("Adding to results: unchanged letter");
        newResult.push(letter);
      }
    }
    lastLetter = letterObject;
  }

  if (closeIndexGrouping.length > 0) {
    console.log("Adding close index grouping: final close index grouping push");
    newResult.push(`**${closeIndexGrouping.join("")}**`);
  }

  return newResult.join("");
}
