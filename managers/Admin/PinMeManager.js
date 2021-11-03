const Discord = require('discord.js');
const { codeBlock, inlineCodeBlock } = require('@discordjs/builders');


class PinMeManager {
    constructor(
        pinMeUserId,
        nominatorId,
        pinMeMessageId,
        pinMeChannelId,
        pinMeGuildId,
        client
    ) {
        this.client = client;
        this.pinMeUserId = pinMeUserId;
        this.nominatorId = nominatorId;
        this.pinMeGuildId = pinMeGuildId;
        this.pinMeMessageId = pinMeMessageId;
        this.pinMeChannelId = pinMeChannelId;
        this.boardManager = client.pinBoardManager;

        this.communityPins = new Discord.Collection();
        this.communityPins.set(this.nominatorId, 'Endorsed');

        this.fetchAsyncData();
        this.tryPin();
    }

    async tryPin() {
        setTimeout(() => {
            this.pinMe()

        }, 5000)
    }

    async fetchAsyncData() {
        try {

            this.pinMeUser = await this.client.users.fetch(this.pinMeUserId, true);
            this.nominator = await this.client.users.fetch(this.nominatorId, true);
            this.guild = await this.client.guilds.fetch(this.pinMeGuildId, true);
            this.channel = await this.guild.channels.fetch(this.pinMeChannelId, true);
            this.nominatedMessage = await this.channel.messages.fetch(this.pinMeMessageId, true);
        } catch (err) {
            console.log(err);
        }
    }
    
    get getPins() {
        return this.communityPins;
    }

    async checkPinner(pinningUserId) {
        const pinCache = client.pinMeGuildsCache
        const pinningUser = await pinCache.get(pinningUserId);

        const availableNominations = await pinningUser.get('availableNominations');

        if (availableNominations == 0) {
            console.log(`${pinningUserId} has no more nominations available`);
            return false;
        } else {
            console.log(`${pinningUserId} has ${availableNominations} nominations available`);
            return true;
        }
    }

    async addPin(pinningUser) {
        const existingPin = this.communityPins.has(pinningUser.id);
        if (existingPin) {
            if (pinningUser.id === '265023187614433282') {
                this.pinMe();
                return console.log('Test Action by Dylan')
            } else {
                return console.log(`User already pinned or Endorsed this nominee`);
            }
        } else {
            this.communityPins.set(pinningUser.id, 'Pinned');
            return console.log(`${pinningUser.id} has been added to this posts pins`);
        }
    }

    async pinMe() {
        const request = {
            preFeature: this.getPins.size,
            duringFeature: null,
            postFeature: null,
            lifetime: null,
            offset: null,
        }
        const message = this.nominatedMessage;
        const guild = this.guild;

        this.boardManager.updateBoardMessages(guild, message, request, this);
    }

}

module.exports = PinMeManager;