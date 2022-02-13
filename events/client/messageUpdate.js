const Discord = require('discord.js');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        if (oldMessage.hasThread) return console.log('Message update event fired for a thread message.');
        if (!oldMessage.author) return console.log('MessageUpdate: No author');
        if (oldMessage.author.bot) return console.log('Message update event fired by a bot');
        if (oldMessage.content.length >= 256) return console.log('Message update event fired for a message with a length of 256 or more.');
        if (newMessage.embeds[0]) {
            // Check messages because of embed
            if (oldMessage.toString() === newMessage.toString()) return;
        }

        const messageGuild = await client.guilds.fetch(newMessage.guildId)
        const messageLogsChannel = messageGuild.channels.cache.find(channel => channel.name === 'message-logs');
        if (!messageLogsChannel) return;

        if (oldMessage.content.length == 0 || newMessage.content.length == 0 ) return console.log('Message update event fired for a message with a length of 0 or less.');

        var registryEmbed = new Discord.MessageEmbed()
        .setAuthor(
            `${newMessage.author.tag} edited a message in #${newMessage.channel.name}`,
            newMessage.author.displayAvatarURL({ dynamic: true }),
            `https://discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id}`
        )
        .setTimestamp()
        .setColor('#887d91')
        .addFields(
            { name: 'Original Message:', value: oldMessage.toString() },
            { name: 'New Message:', value: newMessage.toString() },    
            );
            

        await messageLogsChannel.send({embeds: [registryEmbed]}).catch(error => 		messageLogsChannel.send({content: error.toString()}));
    }
}