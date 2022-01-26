const Discord = require('discord.js');
const { DiscordTogether } = require('discord-together');

const { envUtil } = require('./util/envUtil');

const { PinBoardManager } = require('./managers/admin/PinBoardManager');
const { ChatGameManager } = require('./managers/game_managers/ChatGameManager');

// const { REST } = require('@discordjs/rest');
// const { Routes } = require('discord-api-types/v9');

const myIntents = Discord.Intents.ALL;
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION" ], intents: 32767 });
const token = envUtil.getEnviromentVariable('TEST_TOKEN');


client.instanceRegistry = new Discord.Collection();
client.pinMeGuildsCache = new Discord.Collection();
client.ticketManagerCache = new Discord.Collection();
client.slashCommands = new Discord.Collection();
client.events = new Discord.Collection();

global.DiscordClient = client;
setInterval(() => {
    global.DiscordClient = client;
}, 1000);


client.discordTogether = new DiscordTogether(client);
client.pinBoardManager = new PinBoardManager(client);
client.chatGameManager = new ChatGameManager(client);



['slash_cmd_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
})




client.login(token)