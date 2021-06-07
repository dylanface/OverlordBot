const { ReactionCollector } = require("discord.js");

module.exports = {
    name: 'userindex',
    description: "This can ban someone before they join the discord!",
    guildOnly: "true",
    args: 1,
    permissions: 'BAN_MEMBERS',
    //guildExclusive: "140247578242580481",
    cooldown: 10,
    async execute(client, message, args, Discord) {
        message.delete({ timeout: 20000 }).catch(error => console.log(error));

        const inputID = args[0];
        const inputTag = message.mentions.users.first();
        const channel = message.channel;
        let user;
        let action;
        let confirmMessage;

        const banEmoji = '🔨';
        const kickEmoji = '🦵';
        const warnEmoji = '⛔';
        const cancelEmoji = '❌';
        const confirmEmoji = '✅';

        async function createConfirmEmbed(editToMessage, userID, action, reason) {
            editToMessage.reactions.removeAll();
            if (!reason) {
              const confirmEmbed = new Discord.MessageEmbed()
                .setTitle("Please confirm or cancel this action")
                .setDescription(`You want to \`${action}\` the user \`${userID}\``);
      
              confirmMessage = await editToMessage.edit(confirmEmbed);
              confirmMessage.react(confirmEmoji);
              confirmMessage.react(cancelEmoji);
            } 
        }

        if (inputID) {
            try {
                user = await client.users.fetch(inputID, true)
                const userInfo = new Discord.MessageEmbed()
                    .setColor('#4aff0c')
                    .setTitle('Overlord User Panel')
                    .setDescription(`Fetched User ID: ${user} \nRequested User ID: ${inputID}`)
                    .addFields(
                        { name: 'Ban User', value: `Press ${banEmoji}`, inline: true },
                        { name: 'Kick User', value: `Press ${kickEmoji}`, inline: true },
                        // { name: 'Warn User', value: `Press ${warnEmoji}`, inline: true }
                    )
                    .setFooter(`${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                    const userPrompt = await channel.send(userInfo)
                    userPrompt.react(banEmoji);
                    userPrompt.react(kickEmoji);
                    // userPrompt.react(warnEmoji);

                    client.on("messageReactionAdd", async (reaction, user) => {
                        if (reaction.message.partial) await reaction.message.fetch();
                        if (reaction.partial) await reaction.fetch();
                        if (user.bot) return;
                        if (!reaction.message.guild) return;

                        if (reaction.message.id === userPrompt.id) {
                            switch (reaction.emoji.name) {
                                case banEmoji:
                                    action = "ban";
                                    createConfirmEmbed(userPrompt, user, "ban", null);
                                break;
                                    
                                case kickEmoji:
                                    action = "kick";
                                    createConfirmEmbed(userPrompt, user, "kick", null);  
                                break;
                                        
                                case warnEmoji:      
                                break;
                                            
                                case cancelEmoji:
                                    confirmMessage.delete()      
                                break;
                                                
                                case confirmEmoji:
                                    if (action == "ban") {
                                        message.guild.members.ban(inputID);
                                        console.log(`${message.author.tag} has banned ${inputID}`)
                                        const deleteWarning = new Discord.MessageEmbed()
                                            .setTitle("Action Successful")
                                            .setDescription(`This message will be deleted in 5 seconds`);
                                        
                                        let deleteMessage = await confirmMessage.edit(deleteWarning)
                                        .then(deleteMessage.delete({ timeout: 5000 }));
                                    } 
                                    else if (action == "kick") {
                                        console.log(`${message.author.tag} has kicked ${inputID}`)
                                        const deleteWarning = new Discord.MessageEmbed()
                                            .setTitle("Action Successful")
                                            .setDescription(`This message will be deleted in 5 seconds`);
                                        
                                        let deleteMessage = await confirmMessage.edit(deleteWarning)
                                        .then(deleteMessage.delete({ timeout: 5000 }));
                                        
                                    }
                                break;
                            }

                        } 
                    });



            } catch(error) {
                const errorEmbed = new Discord.MessageEmbed()
                    .setColor('#c0392b')
                    .setTitle('Overlord Error Panel')
                    .addFields(
                        { name: 'Discord Error Message', value: `\` ${error} \``, inline: false },
                        { name: 'Entered Args', value: `\` ${args} \``, inline: false },
                        { name: 'Please Retry', value: `\` The most common error is typos when copying user IDs, make sure to double check the ID you are indexing \``, inline: false }
                    )
                    .setTimestamp()
                    const errorMessage = await channel.send(errorEmbed)
            }
        }
        else if (inputTag) {
            user = inputTag;
            const userPrompt = await channel.send(
                `Right click the user's tag below to open context menu.
                ${user}`)
        }
    
    }
}