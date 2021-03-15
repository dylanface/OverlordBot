const { v4: uuidv4 } = require("uuid");

module.exports = {
  name: "anygamers",
  description: "YO DOES ANYONE WANNA PLAY WITH ME!!!",
  async execute(client, message, args, Discord) {
    const anyGaymersEmoji = "🎮";
    const anyTalkersEmoji = "🗣️";
    const anyWatchersEmoji = "🎥";
    const anyProgrammersEmoji = "🖥️";
    const rsvpEmoji = "📫";
    const busyEmoji = "⏱️";
    const overwatchEmoji = "820741185265729556";
    const rainbowSixEmoji = "820741185370587176";
    const apexLegendsEmoji = "820741183658655744";
    const dbdEmoji = "820741668260937758";
    const stardewEmoji = "820741185500741652";
    const coldWarEmoji = "820741187082125374";
    const otherGameEmoji = "820741185244364820";
    const cancelEmoji = "❌";
    const confirmEmoji = "✅";

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

    let channel = message.channel;
    let user = message.author;
    let notifyActivity;
    let notifyGame;
    let gameMessage;
    let gameName;
    let confirmMessage;
    let userNameArgs = args;

    message.delete();

    const anyTakersEmbed = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setTitle("Any ?")
        .setDescription(`Gamers ‣ ${anyGaymersEmoji} \n 
            Talkers ‣ ${anyTalkersEmoji} \n
            Watchers ‣ ${anyWatchersEmoji} \n
            Programmers ‣ ${anyProgrammersEmoji}`);

    const gameEmbed = new Discord.MessageEmbed()
        .setTitle('What game do you want to play?')
        .setDescription(`Overwatch ‣ <:overwatch:820741185265729556> \n
            Rainbow Six ‣ <:rainbowsix:820741185370587176> \n
            Apex Legends ‣ <:apexlegends:820741183658655744> \n
            Dead By Daylight ‣ <:dbd:820741668260937758> \n
            Stardew Valley ‣ <:stardew:820741185500741652> \n
            Cold War ‣ <:blackops:820741187082125374> \n
            Other Game ‣ <:theclassics:820741185244364820>`);

    async function createConfirmEmbed(sendToChannel, game) {
        if (!game) {
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
              .setDescription(`${user.username} is playing ${gameName}, and is looking for people to play with!`);

            confirmMessage = await sendToChannel.edit(confirmEmbed);
            function utilReact(value) {
              if (confirmMessage) confirmMessage.react(value);
            }
            utilityEmojis.forEach(utilReact);
        }

    }       

    async function createNotifyEmbed(game){
        if (!game) {
            const notifyEmbed = new Discord.MessageEmbed()
                .setTitle(`Hey ${user.username}!`)
                .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(`${user.username} is a ${notifyActivity}`);

                
            notifyMessage = await message.author.send(notifyEmbed);
        }
        if (game) {
            const notifyEmbed = new Discord.MessageEmbed()
                .setTitle('Hey Gamer!')
                .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(`${user.username} is playing ${gameName}, and is looking for people to play with!`);

            notifyMessage = await message.author.send(notifyEmbed);
        }
    }        

    let anyTakersMessage = await channel.send(anyTakersEmbed);
    function anyTakersReact(value) {
        if (anyTakersMessage) anyTakersMessage.react(value);
    }
    anyTakersEmojis.forEach(anyTakersReact);
    

    client.on("messageReactionAdd", async (reaction, user) => {
      if (reaction.message.partial) await reaction.message.fetch();
      if (reaction.partial) await reaction.fetch();
      if (user.bot) return;
      if (!reaction.message.guild) return;

      if (reaction.message.channel === channel) {
        if (anyTakersEmojis.includes(reaction.emoji.name)) {
            anyTakersMessage.reactions.removeAll();
          switch (reaction.emoji.name) {
            case anyGaymersEmoji:
                notifyActivity = 'Gamer';
                gameMessage = await anyTakersMessage.edit(gameEmbed);
                function gamesReact(value) {
                if (gameMessage) gameMessage.react(value);
                }
                gameEmojis.forEach(gamesReact);
              break;

            case anyTalkersEmoji:
                notifyActivity = 'Talker';
                createConfirmEmbed(anyTakersMessage);
              break;

            case anyWatchersEmoji:
                notifyActivity = 'Watcher'; 
                createConfirmEmbed(anyTakersMessage);
              break;

            case anyProgrammersEmoji:
                notifyActivity = 'Programmer';
                createConfirmEmbed(anyTakersMessage);
              break;
          }
        } else if (gameEmojis.includes(reaction.emoji.id)) {
            switch (reaction.emoji.id) {
                case overwatchEmoji:
                    gameName = 'Overwatch';
                    break;
                case rainbowSixEmoji:
                    gameName = 'Rainbow Six';
                    break;
                case apexLegendsEmoji:
                    gameName = 'Apex Legends';
                    break;
                case dbdEmoji:
                    gameName = 'Dead By Daylight';
                    break;
                case stardewEmoji:
                    gameName = 'Stardew Valley';
                    break;
                case coldWarEmoji:
                    gameName = 'Call Of Duty | Black Ops | Cold War';
                    break;
                case otherGameEmoji:
                    gameName = 'poop';
                    break;
            }
            
            gameMessage.reactions.removeAll();
            createConfirmEmbed(gameMessage, gameName);

        } else if (utilityEmojis.includes(reaction.emoji.name)) {
            switch (reaction.emoji.name) {
                case confirmEmoji:
                    createNotifyEmbed(gameName);
                    confirmMessage.delete();
                    message.author.send(`Your message has been sent to ${userNameArgs} and #looking-for-group`)
                    break;
                case cancelEmoji:
                    let deleteWarning = await channel.send('This embed will self destruct in 5 seconds!')
                    setTimeout(function() { confirmMessage.delete(); deleteWarning.delete(); }, 5000);
                    break;
            }
        } else {
            reaction.remove();
        }
      }
    });


  },
};
