const Discord = require('discord.js');
const { OverlordEvent } = require('../database/EventLogger');

/**
 * Main point of contact to publish moderation events to guild-logs.
 */
class ModerationLogger {

    /**
     * @param {Discord.Client} client The client instance.
     */
    constructor(client) {
        this.client = client;
    }

    /**
     * Publishes a moderation event to the guild-logs channel in the provided guild.
     * @param { Discord.Guild } guild The guild to publish the event to.
     * @param { Object } event The event to publish.
     */
    async publish(guild, event) {
        const channel = this.#getLogChannel(guild);
        if (!channel) return console.error(`No channel found for guild ${guild.name}`);

        const { type, suspectId, suspect, moderator, reason } = event;

        if (suspect != undefined && suspectId === undefined) {
            var fetchedSuspect = suspect
        } else {
            var fetchedSuspect = await this.client.users.fetch(suspectId, true)
            event.suspect = fetchedSuspect;
        }

        const embed = this.#moderationEventToEmbed(moderator, type, fetchedSuspect, reason);
        
        try {
            channel.send({ embeds: [embed] });
        } catch {
            console.log('Failed to send registry message');
        }

        try {
            this.#publishToEventLogger(guild, event);
        } catch {
            console.log("Failed to publish to event log.")
        }

    }

    /**
     * Get the log channel for the provided guild.
     * @param {Discord.Guild} guild The guild to get the log channel for.
     */
    #getLogChannel = (guild) => {
        const guildLogChannel = guild.channels.cache.find(channel => channel.name === 'guild-logs');
        if (!guildLogChannel) return false;
        return guildLogChannel;
    }

    /**
     * Convert a moderation event to an log embed.
     * @param { Discord.GuildMember } moderator The moderator who performed this action.
     * @param { String } action The type (or action) of moderation event.
     * @param { Discord.User } suspect The user who was affected by this action.
     * @param { String | undefined } reason The reason for this action.
     */
    #moderationEventToEmbed = (moderator, action, suspect, reason) => {
        const registryEmbed = new Discord.MessageEmbed()
            .setColor('#00ff00')
            .setAuthor({name: `${suspect.tag}`, iconURL: suspect.displayAvatarURL({ dynamic: true })})
            .addFields(
                { name: 'Action:', value: `\`\`\`The user has been ${action}.\`\`\`` },
            )
            .setFooter({text: moderator.user.tag, iconURL: moderator.user.displayAvatarURL({ dynamic: true })})
            .setTimestamp()

        if (reason) registryEmbed.addField('Reason:',`\`\`\`${reason}\`\`\``);
        
        return registryEmbed;
    }

    #publishToEventLogger = (guild, event) => {
        const formattedEvent = new OverlordEvent(this.client)
            .setType(event.type)
            .setAssociatedGuild(guild.id)
            
        if (event['reason']) formattedEvent.setDescription(event.reason);
        else formattedEvent.setDescription(`No reason provided.`);

        if (event['suspect']) formattedEvent.attachContext({ id: 'suspect', item: event.suspect });
        if (event['suspectId'] && !event['suspect']) formattedEvent.attachContext({ id: 'suspectId', item: event.suspectId });
        if (event['moderator']) formattedEvent.attachContext({ id: 'moderator', item: event.moderator });
        if (event['moderatorId'] && !event['moderator']) formattedEvent.attachContext({ id: 'moderatorId', item: event.moderatorId });

        formattedEvent.submit();
    }

}

module.exports = ModerationLogger;