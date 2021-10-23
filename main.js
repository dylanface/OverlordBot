const Discord = require('discord.js');
const { DiscordTogether } = require('discord-together');
const { PinBoardManager } = require('./managers/PinBoardManager');
// const { REST } = require('@discordjs/rest');
// const { Routes } = require('discord-api-types/v9');

require("dotenv").config();

const myIntents = Discord.Intents.ALL;
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION" ], intents: 32767 });


const token = process.env.TEST_TOKEN

client.discordTogether = new DiscordTogether(client);

client.pinBoardManager = new PinBoardManager(client);
client.pinMeGuildsCache = new Discord.Collection();
client.pinMeRegistry = new Discord.Collection();

client.slashCommands = new Discord.Collection();
client.events = new Discord.Collection();

['slash_cmd_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
})

client.login(token)
