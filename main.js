const Discord = require('discord.js');
const { DiscordTogether } = require('discord-together');
const { StartRequestHandler } = require('./components/admin/StatusRequestHandler');

const dotenv = require('dotenv');
dotenv.config()

const ModerationLogger = require('./components/ModerationLogger');
const ErrorHandler = require('./components/admin/ErrorHandler');
const { EventLogger } = require('./database/EventLogger');


const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION" ], intents: 32767 });
const token = process.env.TEST_TOKEN;


client.instanceRegistry = new Discord.Collection();
client.slashCommands = new Discord.Collection();
client.events = new Discord.Collection();


global.DiscordClient = client;
setInterval(() => {
    global.DiscordClient = client;
}, 1000);

client.totalMembers = 0;
StartRequestHandler(client);

client.ModerationLogger = new ModerationLogger(client);
client.discordTogether = new DiscordTogether(client);
client.ErrorHandler = new ErrorHandler(client);
client.EventLogger = new EventLogger(client);

['slash_cmd_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
})

client.login(token);

client.on("ready", () => {

    process.on("uncaughtException", err => client.ErrorHandler.recoverable(err));
})