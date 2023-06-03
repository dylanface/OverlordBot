import { GatewayIntentBits, Partials } from "discord.js";
import { OverlordClient } from "./types/Overlord";

const client = new OverlordClient({
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

[
  "slash_cmd_handler",
  "context_menu_cmd_handler",
  "autocomplete_interaction_handler",
  "event_handler",
].forEach(async (handler) => {
  import(`./handlers/${handler}`).then((module) => module.default(client));
});

client.connect();
