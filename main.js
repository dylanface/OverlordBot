const {
  GatewayIntentBits,
  Partials,
  Collection,
  Client,
} = require("discord.js");
const { REST } = require("@discordjs/rest");
const { DiscordTogether } = require("discord-together");
const { StartRequestHandler } = require("./handlers/status_request_handler");

const dotenv = require("dotenv");
dotenv.config();

const ModerationLogger = require("./components/ModerationLogger");
const ErrorHandler = require("./handlers/error_handler");
const { EventLogger } = require("./components/EventLogger");
const { TrackerController } = require("./components/UserTracker");

const client = new Client({
  partials: [
    Partials.Message,
    Partials.Channel,
    Partials.Channel,
    Partials.Guild,
  ],
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildScheduledEvents,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.Guilds,
  ],
});

const token = process.env.TEST_TOKEN;

client.REST = new REST({ version: "10" }).setToken(token);

client.instanceRegistry = new Collection();
client.events = new Collection();

client.slashCommands = new Collection();
client.contextMenuCommands = new Collection();
client.autocompleteInteractions = new Collection();

client.totalMembers = 0;
StartRequestHandler(client);

client.discordTogether = new DiscordTogether(client);
client.ModerationLogger = new ModerationLogger(client);
client.ErrorHandler = new ErrorHandler(client);
client.EventLogger = new EventLogger(client);
client.TrackerController = new TrackerController(client);

[
  "slash_cmd_handler",
  "context_menu_cmd_handler",
  "autocomplete_interaction_handler",
  "event_handler",
].forEach((handler) => {
  require(`./handlers/${handler}`)(client);
});

client.login(token);

client.once("ready", () => {
  process.on("uncaughtException", (err) =>
    client.ErrorHandler.recoverable(err)
  );
});
