const Discord = require('discord.js');
const builder = require('@discordjs/builders')


class PinBoardManager {
    constructor(
        client
    ) {
        this.client = client;
        this.guildBoards = new Discord.Collection();
}

    getGuildBoard(guild) {
        return this.guildBoards.get(guild.id);
    }

    async registerGuildBoard(guild) {
        if (this.guildBoards.has(guild.id)) {
            this._boardChecks(guild)
        } else {
            this.guildBoards.set(guild.id, new Discord.Collection());
            this._boardChecks(guild)

        }
    }

    async _boardChecks(guild) {
        const guildBoard = this.getGuildBoard(guild);

        try {
            const fetchChannel = await guild.channels.cache.find(channel => channel.name.includes('pin-board'))
            fetchChannel.permissionOverwrites.set([
                {
                    id: guild.roles.everyone,
                    allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'ADD_REACTIONS', 'SEND_MESSAGES_IN_THREADS'],
                    deny: ['SEND_MESSAGES', 'MANAGE_MESSAGES', 'MANAGE_CHANNELS', 'MANAGE_WEBHOOKS', 'USE_EXTERNAL_STICKERS', 'MENTION_EVERYONE', 'MANAGE_ROLES', 'SEND_TTS_MESSAGES', 'CREATE_INSTANT_INVITE', 'EMBED_LINKS', 'ATTACH_FILES', 'USE_EXTERNAL_EMOJIS', 'CREATE_PRIVATE_THREADS', 'CREATE_PUBLIC_THREADS', 'USE_APPLICATION_COMMANDS', 'MANAGE_THREADS'],
                }
            ])
            const fetchStaleMessages = await fetchChannel.messages.fetch()
            if (fetchStaleMessages.size > 0) {
                fetchStaleMessages.forEach(message => {
                    const formattedMessage = {
                        channelId: message.channelId,
                        messageId: message.id,
                        guildId: message.guildId,
                        fullMessage: message,
                        content: message.content,
                        featured: false,
                    }
                    guildBoard.set(message.id, formattedMessage);
                })
                    fetchChannel.bulkDelete(fetchStaleMessages.size).catch(error => console.log(error))
                    console.log(`${guild.id} Passed Pin checks and destroyed ${fetchStaleMessages.size} stale Pins`);      
                }
        } catch (err) {
            return this._createBoard(guild);
        }

    }

    async _createBoard(guild) {
        const guildBoard = this.getGuildBoard(guild.id);
        const generatedPinBoardChannel = await guild.channels.create(`pin-board`, {
            type: 'text',
            position: 0,
            reason: 'PinBoard Creation',
            permissionOverwrites: [
                {
                    id: guild.roles.everyone,
                    allow: ['VIEW_CHANNEL', 'READ_MESSAGE_HISTORY', 'ADD_REACTIONS', 'SEND_MESSAGES_IN_THREADS'],
                    deny: ['SEND_MESSAGES', 'MANAGE_MESSAGES', 'MANAGE_CHANNELS', 'USE_EXTERNAL_STICKERS', 'MANAGE_WEBHOOKS',  'MENTION_EVERYONE', 'MANAGE_ROLES', 'SEND_TTS_MESSAGES', 'CREATE_INSTANT_INVITE', 'EMBED_LINKS', 'ATTACH_FILES', 'USE_EXTERNAL_EMOJIS', 'CREATE_PRIVATE_THREADS', 'CREATE_PUBLIC_THREADS', 'USE_APPLICATION_COMMANDS', 'MANAGE_THREADS'],
                }
            ]
        })
    }

    async updateBoardMessages(guild, message, pinInfo) {
        const guildBoard = this.getGuildBoard(guild.id);

        const {
            preFeature,
            duringFeature,
            postFeature,
            lifetime,
            offset,
        } = pinInfo;

        const formattedMessage = {
            channelId: message.channelId,
            messageId: message.id,
            guildId: message.guildId,
            fullMessage: message,
            content: message.content,
            featured: false,
            preFeaturedPins: preFeature,
            duringFeaturedPins: duringFeature,
            postFeaturedPins: postFeature,
            lifetime: lifetime,
            offset: offset,

        }
        guildBoard.set(message.id, formattedMessage);
        this._refreshBoard(guild);
    }

    async _refreshBoard(guild) {
        const guildBoard = this.getGuildBoard(guild.id);

    }

    async _popularityAlgorithm(guild) {
        const guildBoard = this.getGuildBoard(guild.id);
        
    }
    

}

module.exports.PinBoardManager = PinBoardManager; 