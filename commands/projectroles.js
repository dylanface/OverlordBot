module.exports = {
    name: 'projectroles',
    description: "Set up project roles",
    async execute(client, message, args, Discord) {
        const channel = message.channel;
        const projectNotificationRole = message.guild.roles.cache.find(role => role.name === "Project Notifications");

        const projectNotificationEmoji = '🤝';

        let embed = new Discord.MessageEmbed()
        .setColor('#f9b7f2')
        .setTitle('Would you like to participate in the new project system?')
        .setDescription('Choosing to participate will allow you to claim and submit projects!\n\n'
            + `${projectNotificationEmoji} to become Project Participant`);

        let messageEmbed = await message.channel.send(embed);
        messageEmbed.react(projectNotificationEmoji);

        client.on('messageReactionAdd', async (reaction, user) => {
            if(reaction.message.partial) await reaction.message.fetch();
            if(reaction.partial) await reaction.fetch();
            if(user.bot) return;
            if(!reaction.message.guild) return;

            if(reaction.message.channel.id == channel) {
                if(reaction.emoji.name === projectNotificationEmoji){
                    await reaction.message.guild.members.cache.get(user.id).roles.add(projectNotificationRole);
                }
            } else {
                return;
            }
            
        });

        client.on('messageReactionRemove', async (reaction, user) => {
            if (reaction.message.partial) await reaction.message.fetch();
            if (reaction.partial) await reaction.fetch();
            if (user.bot) return;
            if (!reaction.message.guild) return;

            if (reaction.message.channel.id == channel) {
                if (reaction.emoji.name === projectNotificationEmoji) {
                    await reaction.message.guild.members.cache.get(user.id).roles.remove(projectNotificationRole);
                }
            } else {
                return;
            }
        });
        


    }
}