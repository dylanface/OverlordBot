module.exports = {
  name: "suggest",
  description: "create a suggestion!",
  async execute(client, message, args, Discord) {
    const channel = message.guild.channels.cache.find(
      (c) => c.name === "suggestions"
    );
    if (!channel)
      return message.channel.send(
        "There is no designated suggestions channel!"
      );

    let messageArgs = args.join(" ");

    const suggestionEmbed = new Discord.MessageEmbed()
      .setColor("#FFBC00")
      .setAuthor(
        `${message.author.tag}'s Suggestion`,
        message.author.displayAvatarURL({ dynamic: true })
      )
      .setDescription(messageArgs)
      .setFooter("Vote on this suggestion below!");

      const upVoteEmoji = "⬆️";
      const downVoteEmoji = "⬇️";

    let suggestionVote = await channel.send(suggestionEmbed);
    suggestionVote.react(upVoteEmoji);
    suggestionVote.react(downVoteEmoji);

    message.delete();

    let scoreCount = 0;

    client.on("messageReactionAdd", async (reaction, user) => {
      if (reaction.message.partial) await reaction.message.fetch();
      if (reaction.partial) await reaction.fetch();
      if (user.bot) return;
      if (!reaction.message.guild) return;

      if (reaction.message.channel.id == channel) {
        if (reaction.emoji.name === upVoteEmoji || reaction.emoji.name === downVoteEmoji) {
          if (reaction.emoji.name === upVoteEmoji) {
            scoreCount++;
            console.log(scoreCount);
          }
          if (reaction.emoji.name === downVoteEmoji) {
            scoreCount--;
            console.log(scoreCount);
          }
        }
      }
    })
  },
};