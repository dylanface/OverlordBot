/**
 * Manages moderation actions on behalf of each DiscordUser.
 */
class DiscordUserModeration {
    cache = {
        bans: new Map(),
        kicks: new Map(),
        timeouts: new Map(),
        actionedMessages: new Map(),
        editedMessages: new Map(),
    };
    constructor() {
    }

}

module.exports = DiscordUserModeration;