const Discord = require('discord.js');
const builder = require('@discordjs/builders')


class PinBoardManager {
    constructor(
        client
    ) {
        this.client = client;
        this.guildBoards = new Discord.Collection();
}

    async getGuildBoard(guildId) {
        return this.guildBoards.get(guildId);
    }

    async registerGuildBoard(guild) {
        if (this.guildBoards.has(guild.id)) {
            this._boardChecks(guild)
        } else {
            this.guildBoards.set(guild.id, {
                pinCache: new Discord.Collection(),
                managed: false,
            });
            this._boardChecks(guild)

        }
    }

    async _boardChecks(guild) {
        const guildBoard = this.getGuildBoard(guild.id);

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
                    guildBoard.pinCache.set(message.id, formattedMessage);
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

    async updateBoardMessages(guild, message, pinInfo, manager) {
        const guildBoard = await this.getGuildBoard(guild.id);

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
            PinMeManager: manager,
        }
        guildBoard.pinCache.set(message.id, formattedMessage);
        console.log(guildBoard.pinCache)
        this._popularityAlgorithm(guild)
    }

    async _refreshBoard(guild) {
        const guildBoard = this.getGuildBoard(guild.id);
        const fetchBoardChannel = await guild.channels.cache.find(channel => channel.name.includes('pin-board'))
        const fetchBoardMessages = fetchBoardChannel.messages.size

        if (fetchBoardMessages > 0) {
            fetchBoardChannel.bulkDelete(fetchBoardMessages).catch(error => console.log(error))
            console.log(`${guild.id} Passed Pin checks and destroyed ${fetchBoardMessages} stale Pins`);
        }

        

    }

    async _establishBaseline(guildBoard) {
        const pinValuesForPreAverage = [];
        const pinValuesForTrendingAverage = [];
        const pinValuesForPostAverage = [];

        guildBoard.forEach(async (formMessage) => {
            pinValuesForPreAverage.push(formMessage.preFeaturedPins)
            pinValuesForTrendingAverage.push(formMessage.duringFeaturedPins)
            pinValuesForPostAverage.push(formMessage.postFeaturedPins)
        })

        guildBoard.preAverage = pinValuesForPreAverage.reduce((a, b) => a + b, 0) / pinValuesForPreAverage.length;
        guildBoard.trendingAverage = pinValuesForTrendingAverage.reduce((a, b) => a + b, 0) / pinValuesForTrendingAverage.length;
        guildBoard.postAverage = pinValuesForPostAverage.reduce((a, b) => a + b, 0) / pinValuesForPostAverage.length;
    }

    async _popularityAlgorithm(guild) {
        const guildBoard = await this.getGuildBoard(guild.id);
        
        if (guildBoard.managed === true) {
            return console.log('Managed')
        } else {
            await this._establishBaseline(guildBoard.pinCache)
        }

        const { preAverage, trendingAverage, postAverage, pinCache } = guildBoard;

        pinCache.forEach(formMessage => {
            const { 
                messageId,
                preFeaturedPins, 
                duringFeaturedPins, 
                postFeaturedPins, 
                featured, 
                lifetime, 
                offset 
            } = formMessage;
            
            var preDifference = preFeaturedPins - preAverage || 0;
            var trendingDifference = duringFeaturedPins - trendingAverage || 0;
            var postDifference = postFeaturedPins - postAverage || 0;

            if (featured) {
                var calculatedScore = (preDifference + trendingDifference + postDifference) * 0.8;
            } else {
                var calculatedScore = preDifference + trendingDifference + postDifference;
            }
            
            const popularity = calculatedScore

            formMessage.popularity = popularity;
            console.log(`${messageId} has a popularity of ${popularity.toString()}`);
        })

        
        
    }

    /*
    TODO Plan:
    - Refresh Board calling popularity and time algorithms 
    - redo PinMeManager.js to send formatted messages to refresh function instead of self intenting pinMes
    - post message list
        
    TODO Refresh Board:
    x Step 1) we need to establish a message format that is standardised from now on in refreshBoard function
    - Step 2) we need to establish a way to sort the messages in the board, so that the most popular messages are at the top
    - Step 3) we need to reprogram the PinMeManager.js so that it sends properly formatted messages to the refresh function
    - Step 4) Post the sorted messages to the board in a "Packet" of 5 messages which fills the message with embeds -->
        instead of seperate at run messages for each pin
    - Step 5) Refresh the board with new messages everytime something happens
        (like a new pin, or a timer being reached, ? maybe on startup instead of deleting the channel
        and re-creating it entirely it will dynamilcally reload post)

    TODO Popularty Algorithm:
    - pull the PinMe data from the guild board
    - Do some math and abstraction to set the base data values;
        How many posts do we normally cache for that guild ? How many users pin in that guild normally during a cache period ?
        averagePre, averageDuring, averagePost
        lifetime
        ? offset could be an object with the role offsets passed in for likes
    
    TODO Establish Baseline:
    - 

    Had issues trying to get the roles-based offsets due to the different possibilities for roles, right? 
        yeah but we could lay groundwork for it to exist and make it later
    We still want to use the math of removing certain percentage an hour? 
        something to do with lifetime for this i think would be better so like when was the post first made, when was it pinned, 
        when did its status change, when did it get pulled from the board (post trending) then with the lifetime object data
        we can do a bunch of averaging to see when posts should be removed from the board, and also could eventually
        with more data use it to improve popularity algorithm by making it super localised to channels and topics rather than just the guilds average
    */
    

}

module.exports.PinBoardManager = PinBoardManager; 