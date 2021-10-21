const Discord = require('discord.js');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        if (oldMessage.hasThread) return console.log('Message update event fired for a thread message.');
        if (!oldMessage.author) return console.log('MessageUpdate: No author');
        if (oldMessage.author.bot) return console.log('Message update event fired by a bot');
        if (newMessage.embeds[0]) {
            // Check messages because of embed
            if (oldMessage.toString() === newMessage.toString()) return;
        }

        const messageGuild = await client.guilds.fetch(newMessage.guildId)
        const messageLogsChannel = messageGuild.channels.cache.find(channel => channel.name === 'message-logs');
        console.log(newMessage.author)
        
        
        var registryEmbed = new Discord.MessageEmbed()
        .setAuthor(`${newMessage.author.tag} Edited a Message`, newMessage.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor('#887d91')
        .addFields(
            { name: 'Original Message:', value: oldMessage.toString() },
            { name: 'New Message:', value: newMessage.toString() },    
            );
            

        await messageLogsChannel.send({embeds: [registryEmbed]}).catch(error => 		messageLogsChannel.send({content: error.toString()}));
    }
}