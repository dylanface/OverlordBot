const Discord = require('discord.js');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        if (oldMessage.hasThread) return console.log('MessageUpdate: Message has thread');
        if (!oldMessage.author) return console.log('MessageUpdate: No author');
        if (oldMessage.author.bot) return console.log('MessageUpdate: Author is bot');
        if (oldMessage.content.length >= 1024) return console.log('MessageUpdate: Message exceeds 1024 characters');
        if (oldMessage.content.length == 0 || newMessage.content.length == 0 ) return console.log('MessageUpdate: Message has no content');
        if (newMessage.embeds[0] || oldMessage.embeds[0]) {
          // Check messages because of embed
          if (oldMessage.toString() === newMessage.toString()) return;
        }
        if (oldMessage.content.includes('overlord-ignore') || newMessage.content.includes('overlord-ignore')) {
            return console.log('MessageUpdate: Message contains overlord-ignore');
        }

        const messageGuild = await client.guilds.fetch(newMessage.guildId)
        const messageLogsChannel = messageGuild.channels.cache.find(channel => channel.name === 'message-logs');
        if (!messageLogsChannel) return;


        const mobileLink = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setLabel('Go To Message')
                    .setStyle('LINK')
                    .setURL(`https://discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id}`)
            )

        const registryEmbed = new Discord.MessageEmbed()
        .setAuthor({
            name: `${newMessage.author.tag} edited a message in #${newMessage.channel.name}`,
            iconURL: newMessage.author.displayAvatarURL({ dynamic: true }),
            url: `https://discord.com/channels/${newMessage.guildId}/${newMessage.channelId}/${newMessage.id}`
        })
        .setTimestamp()
        .setColor('#887d91')
        .addFields(
            { name: 'Original Message:', value: oldMessage.toString() },
            { name: 'New Message:', value: newMessage.toString() },    
            );
            

        await messageLogsChannel.send({ embeds: [registryEmbed], components:[mobileLink] }).catch(error => messageLogsChannel.send({content: error.toString()}));
    }
}