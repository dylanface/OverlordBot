const Discord = require('discord.js');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        if (newMessage.hasThread) return;
        if (!oldMessage.author) return;
        if (oldMessage.author.bot) return;
        if (newMessage.embeds[0]) {
            // Check messages because of embed
            if (oldMessage.toString() === newMessage.toString()) return;
        }

        const messageLog = client.channels.cache.find(channel => channel.name ==='message-logs');
        var registryEmbed = new Discord.MessageEmbed()
        .setAuthor(`${newMessage.author.tag} Edited a Message`, newMessage.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor('#887d91')
        .addFields(
            { name: 'Original Message:', value: oldMessage.toString() },
            { name: 'New Message:', value: newMessage.toString() },    
        );
            
        messageLog.send(registryEmbed);
            
    }
}