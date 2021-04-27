const Discord = require('discord.js');
require("dotenv").config();

const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION" ]});
const token = process.env.TEST_TOKEN

client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.cooldowns = new Discord.Collection();

['command_handler', 'event_handler'].forEach(handler =>{
    require(`./handlers/${handler}`)(client, Discord);
})



client.login(token);