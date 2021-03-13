const { MessageEmbed } = require("discord.js");
const { v4: uuidv4 } = require("uuid");

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

//Begin voting process below

   function embedRecord(messageId, upVotes, downVotes, voters) {
     this.messageId = messageId;
     this.uuid = uuidv4();
     this.upVotes = upVotes;
     this.downVotes = downVotes;
     this.voters = voters;
   }     
   
    let upVoteCount = 0;
    let downVoteCount = 0;
    let whoVoted = [];
    let totalScore = upVoteCount - downVoteCount;

    let voteRecord = new embedRecord(
      suggestionVote.id,
      upVoteCount,
      downVoteCount,
      whoVoted
    );

    function evaluate(upVotes, downVotes, voters) {
      let upVotePercent = (upVotes / voters) * 100;
      let downVotePercent = (downVotes / voters) * 100;

      if (voteRecord.totalScore > voteRecord.voters) return false;
      if (upVotePercent > downVotePercent && downVotePercent > 10) return true;
    }

    client.on("messageReactionAdd", async (reaction, user) => {
      if (reaction.message.partial) await reaction.message.fetch();
      if (reaction.partial) await reaction.fetch();
      if (user.bot) return;
      if (!reaction.message.guild) return;

      if (reaction.message.channel.id == channel) {
        if (reaction.message.id === voteRecord.messageId) {
          if (reaction.emoji.name === upVoteEmoji || reaction.emoji.name === downVoteEmoji) {
            if (reaction.emoji.name === upVoteEmoji) {
              if (!voteRecord.voters.includes(user.tag)) {
                voteRecord.voters.push(user.tag);
                voteRecord.upVotes++;
                console.log(voteRecord);

                let evaluation = await new evaluate(
                  voteRecord.upVotes,
                  voteRecord.downVotes,
                  voteRecord.voters.length
                );

                if (evaluation) {
                  let winnerEmbed = new Discord.MessageEmbed()
                    .setColor("#FFBC00")
                    .setAuthor(
                      `${message.author.tag}'s Suggestion`,
                      message.author.displayAvatarURL({ dynamic: true })
                    )
                    .setDescription(messageArgs)
                    .setFooter(
                      `The evaluated voting score for this suggestion was ${totalScore}!`
                    );

                  let approved = message.guild.channels.cache.find(
                    (a) => a.name === "approved-suggestions"
                  );

                  approved.send(winnerEmbed);
                }
              } else {
                console.log(`${user.tag} has already voted`);
              }
            }
            if (reaction.emoji.name === downVoteEmoji) {
              if (!voteRecord.voters.includes(user.tag)) {
                voteRecord.voters.push(user.tag);
                voteRecord.downVoteCount++;
              } else {
                console.log(`${user.tag} has already voted`);
              }
            }
          }
      }
    }
    });
    console.log(voteRecord);


  },
};
