const Discord = require('discord.js');
const { REST } = require('@discordjs/rest');
const { DiscordTogether } = require('discord-together');
const { StartRequestHandler } = require('./handlers/status_request_handler');

const dotenv = require('dotenv');
dotenv.config()

const ModerationLogger = require('./components/ModerationLogger');
const ErrorHandler = require('./handlers/error_handler');
const { EventLogger } = require('./components/EventLogger');
const { TrackerController } = require('./components/UserTracker');


const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION" ], intents: 32767 });
const token = process.env.TEST_TOKEN;


client.REST = new REST({ version: "9" }).setToken(token);

client.instanceRegistry = new Discord.Collection();
client.slashCommands = new Discord.Collection();
client.contextMenuCommands = new Discord.Collection();
client.events = new Discord.Collection();



global.DiscordClient = client;
setInterval(() => {
    global.DiscordClient = client;
}, 1000);

client.totalMembers = 0;
StartRequestHandler(client);

client.discordTogether = new DiscordTogether(client);
client.ModerationLogger = new ModerationLogger(client);
client.ErrorHandler = new ErrorHandler(client);
client.EventLogger = new EventLogger(client);
client.TrackerController = new TrackerController(client);

['slash_cmd_handler', 'context_menu_cmd_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

client.login(token);

client.once("ready", () => {

    process.on("uncaughtException", err => client.ErrorHandler.recoverable(err));
})