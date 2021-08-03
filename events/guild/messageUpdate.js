const Discord = require('discord.js');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage, client) {
        if (oldMessage.hasThread) return;
        if (!oldMessage.author) return;
        if (oldMessage.author.bot) return;
        if (newMessage.embeds[0]) {
            // Check messages because of embed
            if (oldMessage.toString() === newMessage.toString()) return;
        }

        const messageLog = await client.channels.cache.find(channel => channel.name ==='message-logs')
        
        const logToGuild = messageLog.guild.id
        
        var registryEmbed = new Discord.MessageEmbed()
        .setAuthor(`${newMessage.author.tag} Edited a Message`, newMessage.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor('#887d91')
        .addFields(
            { name: 'Original Message:', value: oldMessage.toString() },
            { name: 'New Message:', value: newMessage.toString() },    
        );
        
          if (newMessage.channel.guild.id === logToGuild) {  
        await messageLog.send({embeds: [registryEmbed]}).catch(error => 		messageLog.send({content: error.toString()}));
          } else {console.log('This message was not edited in a selected guild.')  }
    }
}