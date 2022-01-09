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
    messagesAtLarge = [];
    constructor(
        interaction
    ) {
        this.interaction = interaction;
        this.author = interaction.member;
    }
}



module.exports = TicketManager;