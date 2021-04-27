const { v4: uuidv4 } = require("uuid");

module.exports = {
  name: "anygamers",
  description: "YO DOES ANYONE WANNA PLAY WITH ME!!!",
  guildOnly: "true",
  cooldown: 5,
  async execute(client, message, args, Discord) {
    // Event emojis defined below
    const anyGaymersEmoji = "🎮";
    const anyTalkersEmoji = "🗣️";
    const anyWatchersEmoji = "🎥";
    const anyProgrammersEmoji = "🖥️";
    const rsvpEmoji = "📫";
    const busyEmoji = "⏰";
    const overwatchEmoji = "820741867678335007";
    const rainbowSixEmoji = "820741868052283443";
    const apexLegendsEmoji = "820741867628920834";
    const dbdEmoji = "820741868207341610";
    const stardewEmoji = "820741868135907328";
    const coldWarEmoji = "820741868706988092";
    const otherGameEmoji = "820741867683053599";
    const cancelEmoji = "❌";
    const confirmEmoji = "✅";

    // Time emojis defined below
    const oneClockEmoji = "🕐";
    const twoClockEmoji = "🕑";
    const threeClockEmoji = "🕒";
    const fiveClockEmoji = "🕓";
    const fourClockEmoji = "🕔";
    const sixClockEmoji = "🕕";
    const sevenClockEmoji = "🕖";
    const eightClockEmoji = "🕗";
    const nineClockEmoji = "🕘";
    const tenClockEmoji = "🕙";
    const elevenClockEmoji = "🕚";
    const twelveClockEmoji = "🕛";

    // Number emojis defined below
    const oneEmoji = "1️⃣";
    const twoEmoji = "2️⃣";
    const threeEmoji = "3️⃣";
    const fourEmoji = "4️⃣";
    const fiveEmoji = "5️⃣";
    const sixEmoji = "6️⃣";
    const sevenEmoji = "7️⃣";
    const eightEmoji = "8️⃣";
    const nineEmoji = "9️⃣";
    const tenEmoji = "🔟";

    // Create arrays to categorize and later iterate through emojis below
    const anyTakersEmojis = [
      anyGaymersEmoji,
      anyTalkersEmoji,
      anyWatchersEmoji,
      anyProgrammersEmoji,
    ];

    const notifyEmojis = [rsvpEmoji, busyEmoji];

    const gameEmojis = [
      overwatchEmoji,
      rainbowSixEmoji,
      apexLegendsEmoji,
      dbdEmoji,
      stardewEmoji,
      coldWarEmoji,
      otherGameEmoji,
    ];

    const utilityEmojis = [confirmEmoji, cancelEmoji];

    const clockEmojis = [
      oneClockEmoji,
      twoClockEmoji,
      threeClockEmoji,
      fourClockEmoji,
      fiveClockEmoji,
      sixClockEmoji,
      sevenClockEmoji,
      eightClockEmoji,
      nineClockEmoji,
      tenClockEmoji,
    ];

    const numberEmojis = [
      oneEmoji,
      twoEmoji,
      threeEmoji,
      fourEmoji,
      fiveEmoji,
      sixEmoji,
      sevenEmoji,
      eightEmoji,
      nineEmoji,
      tenEmoji,
    ];

    // Initialize function variables
    let channel = message.channel;
    let user = message.author;
    let notifyActivity;
    let gameMessage;
    let gameName;
    let watchingName;
    let confirmMessage;
    let scheduleMessage;
    let today = new Date().toString().slice(0, 11);

    message.delete();

    // Create global embeds
    const anyTakersEmbed = new Discord.MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Any ?").setDescription(`Gamers ‣ ${anyGaymersEmoji} \n 
            Talkers ‣ ${anyTalkersEmoji} \n
            Watchers ‣ ${anyWatchersEmoji} \n
            Programmers ‣ ${anyProgrammersEmoji}`);

    const gameEmbed = new Discord.MessageEmbed().setTitle(
      "What game do you want to play?"
    ).setDescription(`Overwatch ‣ <:overwatch:820741867678335007> \n
            Rainbow Six ‣ <:rainbowsix:820741868052283443> \n
            Apex Legends ‣ <:apexlegends:820741867628920834> \n
            Dead By Daylight ‣ <:dbd:820741868207341610> \n
            Stardew Valley ‣ <:stardew:820741868135907328> \n
            Cold War ‣ <:blackops:820741868706988092> \n
            Other Game ‣ <:classics:820741867683053599>`);

    // Begin command logic
    async function createConfirmEmbed(sendToChannel, game, media) {
      if (!game && !media) {
        const confirmEmbed = new Discord.MessageEmbed()
          .setTitle("Please confirm or cancel the message below")
          .setDescription(`${user.username} is a ${notifyActivity}`);

        confirmMessage = await sendToChannel.edit(confirmEmbed);
        function utilReact(value) {
          if (confirmMessage) confirmMessage.react(value);
        }
        utilityEmojis.forEach(utilReact);
      }
      if (game) {
        const confirmEmbed = new Discord.MessageEmbed()
          .setTitle("Please confirm or cancel the message below")
          .setDescription(
            `${user.username} is playing ${gameName}, and is looking for people to play with!`
          );

        confirmMessage = await sendToChannel.edit(confirmEmbed);
        function utilReact(value) {
          if (confirmMessage) confirmMessage.react(value);
        }
        utilityEmojis.forEach(utilReact);
      }
      if (media) {
        const confirmEmbed = new Discord.MessageEmbed()
          .setTitle("Please confirm or cancel the message below")
          .setDescription(
            `${user.username} is watching ${watchingName}, and is looking for people to watch with!`
          );

        confirmMessage = await sendToChannel.edit(confirmEmbed);
        function utilReact(value) {
          if (confirmMessage) confirmMessage.react(value);
        }
        utilityEmojis.forEach(utilReact);
      }
    }

    async function createNotifyEmbed(game, media) {
      if (!game && !media) {
        const notifyEmbed = new Discord.MessageEmbed()
          .setFooter(
            `LFG from ${message.author.username}`,
            message.author.displayAvatarURL({ dynamic: true })
          )
          .setDescription(`${user.username} is a ${notifyActivity}`);

        guildNotify(notifyEmbed);
      }
      if (game) {
        const notifyEmbed = new Discord.MessageEmbed()
          .setFooter(
            `LFG from ${message.author.username}`,
            message.author.displayAvatarURL({ dynamic: true })
          )
          .setDescription(
            `${user.username} is playing ${game}, and is looking for people to play with!`
          );

        guildNotify(notifyEmbed);
      }
      if (media) {
        const notifyEmbed = new Discord.MessageEmbed()
          .setFooter(
            `LFG from ${message.author.username}`,
            message.author.displayAvatarURL({ dynamic: true })
          )
          .setDescription(
            `${user.username} is watching ${media}, and is looking for people to watch with!`
          );

        guildNotify(notifyEmbed);
      }
    }

    async function guildNotify(embed) {
      const lfgChannel = message.guild.channels.cache.find(
        (c) => c.name === "looking-for-group"
      );
      if (lfgChannel) {
        lfgChannel.send(embed);
        let gameNotifsGroups = [
          "822301978901479474",
          "822302137346162699",
          "822302218488643614",
          "822302316983091211",
          "822302396176793661",
          "822302483161284658",
        ];
        gameNotifsGroups.forEach((role) => {
          notifyGroup = message.guild.roles.cache.get(role);
          if (gameName === notifyGroup.name) {
            notifyGroup.members.forEach((member) => {
              if (member.id != client.user.id && !member.user.bot)
                member.send(embed);
              console.log(`Sent notification to ${member.displayname}`);
            });
          }
        });
      }
      if (!lfgChannel) message.author.send(embed);
    }

    let anyTakersMessage = await channel.send(anyTakersEmbed);
    function anyTakersReact(value) {
      if (anyTakersMessage) anyTakersMessage.react(value);
    }
    anyTakersEmojis.forEach(anyTakersReact);

    // Start listener
    client.on("messageReactionAdd", async (reaction, user) => {
      if (reaction.message.partial) await reaction.message.fetch();
      if (reaction.partial) await reaction.fetch();
      if (user.bot) return;
      if (!reaction.message.guild) return;

      if (reaction.message.channel === channel) {
        if (user == message.author) {
          if (args.length === 0) {
            if (anyTakersEmojis.includes(reaction.emoji.name)) {
              anyTakersMessage.reactions.removeAll();
              switch (reaction.emoji.name) {
                case anyGaymersEmoji:
                  notifyActivity = "Gamer";
                  gameMessage = await anyTakersMessage.edit(gameEmbed);
                  function gamesReact(value) {
                    if (gameMessage) gameMessage.react(value);
                  }
                  gameEmojis.forEach(gamesReact);
                  break;

                case anyTalkersEmoji:
                  notifyActivity = "Talker";
                  createConfirmEmbed(anyTakersMessage);
                  break;

                case anyWatchersEmoji:
                  notifyActivity = "Watcher";
                  message.channel
                    .send(
                      "Please enter the name of your desired movie, tv show, or youtube video as a discord message in this channel!"
                    )
                    .then((inputRequestMessage) => {
                      const filter = (m) => message.author.id === m.author.id;
                      inputRequestMessage.delete({ timeout: 12000 });

                      message.channel
                        .awaitMessages(filter, {
                          time: 60000,
                          max: 1,
                          errors: ["time"],
                        })
                        .then(async (messages) => {
                          const inputConfirmationMessage = await message.channel.send(
                            `You entered: ${messages.first().content}`
                          );
                          watchingName = messages.first().content;
                          messages.first().delete({ timeout: 1000 });
                          inputConfirmationMessage.delete({ timeout: 10000 });

                          createConfirmEmbed(
                            anyTakersMessage,
                            null,
                            watchingName
                          );
                        })
                        .catch(async () => {
                          const inputDeleteWarning = await message.channel.send(
                            "You did not enter a movie, tv show, or youtube video title!"
                          );
                          inputDeleteWarning.delete({ timeout: 5000 });
                        });
                    });
                  break;

                case anyProgrammersEmoji:
                  notifyActivity = "Programmer";
                  createConfirmEmbed(anyTakersMessage);
                  break;
              }
            } else if (gameEmojis.includes(reaction.emoji.id)) {
              switch (reaction.emoji.id) {
                case overwatchEmoji:
                  gameName = "Overwatch";
                  createConfirmEmbed(gameMessage, gameName);
                  break;
                case rainbowSixEmoji:
                  gameName = "Rainbow Six";
                  createConfirmEmbed(gameMessage, gameName);
                  break;
                case apexLegendsEmoji:
                  gameName = "Apex Legends";
                  createConfirmEmbed(gameMessage, gameName);
                  break;
                case dbdEmoji:
                  gameName = "Dead By Daylight";
                  createConfirmEmbed(gameMessage, gameName);
                  break;
                case stardewEmoji:
                  gameName = "Stardew Valley";
                  createConfirmEmbed(gameMessage, gameName);
                  break;
                case coldWarEmoji:
                  gameName = "Call Of Duty";
                  createConfirmEmbed(gameMessage, gameName);
                  break;
                case otherGameEmoji:
                  message.channel
                    .send(
                      "Please enter the name of your desired game as a discord message in this channel!"
                    )
                    .then((inputRequestMessage) => {
                      const filter = (m) => message.author.id === m.author.id;
                      inputRequestMessage.delete({ timeout: 15000 });

                      message.channel
                        .awaitMessages(filter, {
                          time: 60000,
                          max: 1,
                          errors: ["time"],
                        })
                        .then(async (messages) => {
                          const inputConfirmationMessage = await message.channel.send(
                            `You entered: ${messages.first().content}`
                          );
                          gameName = messages.first().content;
                          messages.first().delete({ timeout: 1000 });
                          inputConfirmationMessage.delete({ timeout: 10000 });

                          createConfirmEmbed(gameMessage, gameName);
                        })
                        .catch(async () => {
                          const inputDeleteWarning = await message.channel.send(
                            "You did not enter a game title!"
                          );
                          inputDeleteWarning.delete({ timeout: 5000 });
                        });
                    });
                  break;
              }
              gameMessage.reactions.removeAll();
            } else if (utilityEmojis.includes(reaction.emoji.name)) {
              switch (reaction.emoji.name) {
                case confirmEmoji:
                  createNotifyEmbed(gameName, watchingName);
                  confirmMessage.delete();
                  if (args >= 1)
                    message.author.send(
                      `Your message has been sent to #looking-for-group`
                    );
                  break;
                case cancelEmoji:
                  let deleteWarning = await channel.send(
                    "This embed will self destruct in 5 seconds!"
                  );
                  confirmMessage.delete({ timeout: 5000 });
                  deleteWarning.delete({ timeout: 5000 });
                  break;
              }
            }
          } else if (args.length >= 1 && args == "schedule") {
              async function createScheduleEmbed() {
                const timeEmbed = new Discord.MessageEmbed()
                  .setTitle("What time would you like to schedule this event for?")
                  .setDescription(`Today is ${today}`);
                  
                scheduleMessage = await channel.send(timeEmbed);
                function numberReact(value) {
                  scheduleMessage.react(value);
                }
                numberEmojis.forEach(numberReact);
              }
              createScheduleEmbed();
          }
        }
      }
    });
    // End listener
  },
};
// Yay we done!
