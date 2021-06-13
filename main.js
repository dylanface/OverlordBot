const Discord = require('discord.js');
require("dotenv").config();

const myIntents = Discord.Intents.ALL;
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION" ], intents: myIntents });

const token = process.env.TEST_TOKEN

client.slashCommands = new Discord.Collection();
client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.cooldowns = new Discord.Collection();

['command_handler', 'slash_cmd_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
})



client.login(token);