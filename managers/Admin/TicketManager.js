const Discord = require('discord.js');
const GuildInstanceManager = require('../GuildInstanceManager');


class TicketManager extends GuildInstanceManager {
    constructor(
        guild,
        client
        ) {
            super(guild, client);
        }
        
        startTicket(interaction) {
            const ticket = new Ticket(interaction);
            return this.cacheInstance(ticket);
        }

        getTicket(query) {
            return this.getInstance(query);
        }
        
}
    
class Ticket {
    questions = {
        required: false,
        questionsComplete: false,
        attachment: false,
        reachMethod: 'simple',
    }
    interaction;
    author;
    thread = null;
    DM = null;
    messagesAtLarge = [];

    constructor(
        interaction
    ) {
        this.interaction = interaction;
        this.author = interaction.user;
    }

    /**
     * If the ticket exists in within the guild, find it, refresh it, then return it.
     * @param {Boolean} [upsert=false] If the ticket does not exist in the guild send it as a new ticket.
     */
    refresh() {

    }

    /**
     * 
     */
}



module.exports = TicketManager;