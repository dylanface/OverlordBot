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
        this.onDisplay = false;

        this.communityPins = new Discord.Collection();
        this.communityPins.set(this.nominatorId, 'Endorsed');

        this.fetchAsyncData();
        this.updateRegistry();
    }
    
    updateRegistry() {
        this.client.pinMeRegistry.set(this.pinMeMessageId, this);
        console.log(`Registry Updated`)
    }

    async fetchAsyncData() {
        try {

            this.pinMeUser = await this.client.users.fetch(this.pinMeUserId, true);
            this.nominator = await this.client.users.fetch(this.nominatorId, true);
            this.guild = await this.client.guilds.fetch(this.pinMeGuildId, true);
            this.channel = await this.guild.channels.fetch(this.pinMeChannelId, true);
            this.nominatedMessage = await this.channel.messages.fetch(this.pinMeMessageId, true);
            this.endorseMe();
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

    async endorseMe() {
        this.nominatedMessage.reactions.removeAll();
        this.nominatedMessage.react('📌');
        this.popularityAssessment();
    }
    
    popularityAssessment() {
        const givenPins = this.communityPins.size;
        if (givenPins > 0) {
            this.pinMe();
        }
    }

    async addPin(pinningUserId) {
        const existingPin = await this.communityPins.get(pinningUserId);
        if (existingPin) {
            return console.log(`User already pinned or Endorsed this nominee`);
        } else {
            this.communityPins.set(pinningUserId, 'Pinned');
            this.popularityAssessment();
            return console.log(`${pinningUserId} has been added to this posts pins`);
        }
    }

    async pinMe() {
        if (this.onDisplay) return;

        const pinMeChannel = await this.guild.channels.cache.find(channel => channel.name.includes('pin-board'));

        const pinMeEmbed = new Discord.MessageEmbed()
            .setColor(this.pinMeUser.hexAccentColor)
            .setAuthor(this.pinMeUser.username, this.pinMeUser.displayAvatarURL({ dynamic: true }))
            .setFooter(`${this.nominator.username} nominated this post and it now has ${this.communityPins.size} supporting Pins!`)
            .setTimestamp()
        if (this.nominatedMessage.attachments.size == 1) {
            pinMeEmbed.setImage(this.nominatedMessage.attachments.first().proxyURL);
        }
        if (this.nominatedMessage.content) {
            pinMeEmbed.setDescription(this.nominatedMessage.content.toString());
        }

        await pinMeChannel.send({ embeds: [pinMeEmbed] })
        .then((pinMeMessage) => {
            this.pinnedPost = pinMeMessage;
            this.onDisplay = true;
            this.updateRegistry();
        })
    }

}

module.exports = PinMeManager;