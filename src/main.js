const {
  GatewayIntentBits,
  Partials,
  Collection,
  Client,
  Events,
} = require("discord.js");
const { REST } = require("@discordjs/rest");

const dotenv = require("dotenv");
dotenv.config();

const { StartRequestHandler } = require("./handlers/status_request_handler");
const { ErrorHandler } = require("./handlers/error_handler");

const { EventLogger } = require("./modules/EventLogger");
const { ModerationLogger } = require("./modules/ModerationLogger");
const { UserProfileManager } = require("./modules/UserProfiles/UserProfile");
const { GuildSettingsManager } = require("./modules/GuildSettings");

const client = new Client({
  partials: [Partials.Message, Partials.Channel, Partials.Channel],
  intents: [
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildModeration,
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
client.subCommands = new Collection();
client.contextMenuCommands = new Collection();
client.autocompleteInteractions = new Collection();

StartRequestHandler(client);

client.ModerationLogger = new ModerationLogger(client);
client.ErrorHandler = new ErrorHandler(client);
client.EventLogger = new EventLogger(client);

client.UserProfileManager = new UserProfileManager(client);
client.GuildSettingsManager = new GuildSettingsManager(client);

[
  "slash_cmd_handler",
  "context_menu_cmd_handler",
  "autocomplete_interaction_handler",
  "event_handler",
].forEach((handler) => {
  require(`./handlers/${handler}`)(client);
});

client.login(token);

client.once(Events.ClientReady, () => {
  process.on("uncaughtException", (err) =>
    client.ErrorHandler.recoverable(err)
  );
});