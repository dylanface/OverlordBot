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

    async _boardChecks(guild) {
        const guildBoard = this.getGuildBoard(guild);

        try {
            const fetchChannel = await guild.channels.cache.find(channel => channel.name.includes('pin-board'))
            const fetchStaleMessages = await fetchChannel.messages.fetch()
                fetchStaleMessages.forEach(message => {
                    const formattedMessage = {
                        channelId: message.channelId,
                        messageId: message.id,
                        guildId: message.guildId,
                        fullMessage: message,
                        content: message.content,
                    }
                    guildBoard.set(message.id, formattedMessage);
                    message.delete()
                })
                console.log(`${guild.id} Passed Pin checks and destroyed stale ${fetchStaleMessages.size}`);      
        } catch (err) {
            console.log(err);
        }

    }

    async registerGuildBoard(guild) {
        if (this.guildBoards.has(guild.id)) {
            this._boardChecks(guild)
        } else {
            this.guildBoards.set(guild.id, new Discord.Collection());
            this._boardChecks(guild)

        }
    }

    

}

module.exports.PinBoardManager = PinBoardManager; 