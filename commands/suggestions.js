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

    let whoVoted = [];

    function evaluate(score, voters) {
      if (score > voters) return false;
      if (score === 1) return true;
    }

    client.on("messageReactionAdd", async (reaction, user) => {
      if (reaction.message.partial) await reaction.message.fetch();
      if (reaction.partial) await reaction.fetch();
      if (user.bot) return;
      if (!reaction.message.guild) return;

      if (reaction.message.channel.id == channel) {
        if (
          reaction.emoji.name === upVoteEmoji ||
          reaction.emoji.name === downVoteEmoji
        ) {
          if (reaction.emoji.name === upVoteEmoji) {
            if (!whoVoted.includes(user.tag)) {
              whoVoted.push(user.tag);
              scoreCount++;

              let evaluation = await new evaluate(scoreCount, whoVoted.length);

              if (evaluation) {
                let winnerEmbed = new Discord.MessageEmbed()
                  .setColor("#FFBC00")
                  .setAuthor(
                    `${message.author.tag}'s Suggestion`,
                    message.author.displayAvatarURL({ dynamic: true })
                  )
                  .setDescription(messageArgs)
                  .setFooter(
                    `The evaluated voting score for this suggestion was ${scoreCount}!`
                  );

                let approved = message.guild.channels.cache.find(
                  (a) => a.name === "approved-suggestions"
                );

                approved.send(winnerEmbed);
              }
            } else {
              return;
            }

            console.log(scoreCount);
            console.log(whoVoted);
          }
          if (reaction.emoji.name === downVoteEmoji) {
            if (!whoVoted.includes(user.tag)) {
              whoVoted.push(user.tag);
              scoreCount--;
            } else {
              return;
            }

            console.log(scoreCount);
            console.log(whoVoted);
          }
        }
      }
    });
    
  },
};
