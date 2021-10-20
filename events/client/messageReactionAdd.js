const Discord = require("discord.js");
const PinMeManager = require("../../managers/PinMeManager");

module.exports = {
	name: 'messageReactionAdd',
	async execute(messageReaction, user, client) {
        if (user.bot) return;
        const fetchedChannel = await client.channels.cache.get(messageReaction.message.channelId)
        const fetchedMessage = await fetchedChannel.messages.fetch(messageReaction.message.id)

        const pinMeGuildsCache = await client.pinMeGuildsCache.get(fetchedChannel.guild.id)
        if (!pinMeGuildsCache) return;
        const pinMeUser = await pinMeGuildsCache.get(user.id)
        const availableNominations = await pinMeUser.get('availableNominations')

        if (messageReaction.emoji.name === "📌") {
            const fetchedPin = await client.pinMeRegistry.get(messageReaction.message.id)
            if (fetchedPin) return fetchedPin.addPin(user.id);
            else {
                if (availableNominations > 0) {
                    console.log(`${user.username} reacted with ${messageReaction.emoji.name} to ${fetchedMessage.id}`);
                    pinMeUser.set('nominatedPosts', pinMeUser.get('nominatedPosts') + 1 || 1)
                    pinMeUser.set('availableNominations', availableNominations - 1)
        
                    const nomineePinMeManager = new PinMeManager(fetchedMessage.author.id, user.id, fetchedMessage.id, fetchedChannel.id, fetchedMessage.guild, client);
                } else {
                    console.log(`${user.username} reacted with ${messageReaction.emoji.name} to ${messageReaction.messageId} but has no nominations left`);
                    messageReaction.users.remove(user.id);
                }
            }

        }


    }
}