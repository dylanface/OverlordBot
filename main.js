const Discord = require('discord.js');
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION" ]});

client.commands = new Discord.Collection();
client.events = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler =>{
    require(`./handlers/${handler}`)(client, Discord);
})


client.login('ODExNDQ1NTg1MDI1ODI2ODI2.YCyTlw.PwXVNOXCXndBcLhh7jAaJGu5nz0');