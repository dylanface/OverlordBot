const Discord = require("discord.js");
const PinMe = require("../../components/admin/PinMeManager");

module.exports = {
	name: 'messageReactionAdd',
	async execute(messageReaction, user, client) {
        if (user.bot) return;
        const fetchedChannel = await client.channels.cache.get(messageReaction.message.channelId)
        const fetchedMessage = await fetchedChannel.messages.fetch(messageReaction.message.id)
        
        if (messageReaction.emoji.name === "📌") {
            const pinMeGuildsCache = await client.pinMeGuildsCache.get(fetchedChannel.guild.id)
            if (!pinMeGuildsCache) return;
            const pinMeUser = await pinMeGuildsCache.get(user.id)
            const availableNominations = await pinMeUser.get('availableNominations')
            
            const fetchedGuild = await client.pinBoardManager.getGuildBoard(messageReaction.message.guild.id)
            const fetchedPin = await fetchedGuild.pinCache.get(messageReaction.message.id)
            if (fetchedPin) return fetchedPin.PinMeManager.addPin(user);
            else {

                if (availableNominations > 0) {
                    console.log(`${user.username} reacted with ${messageReaction.emoji.name} to ${fetchedMessage.id}`);
                    pinMeUser.set('nominatedPosts', pinMeUser.get('nominatedPosts') + 1 || 1)
                    pinMeUser.set('availableNominations', availableNominations - 1)
        
                    var manager = new PinMe(fetchedMessage.author.id, user.id, fetchedMessage.id, fetchedChannel.id, fetchedMessage.guild.id, client)
                } else {
                    console.log(`${user.username} reacted with ${messageReaction.emoji.name} to ${messageReaction.messageId} but has no nominations left`);
                    messageReaction.users.remove(user.id);
                }

            }
                
        }


    }
}