module.exports = {
enabled: false,
name: 'techticket',
description: 'Open a tech ticket',
options: [
    {
        name: 'attachment',
        description: 'Would you like to attach images to this ticket?',
        type: 'BOOLEAN',
        required: false
    },
],
async execute(interaction, client) {

    const TicketManager = await client.ticketManagerCache.get(interaction.guild.id);
    if (!TicketManager) return interaction.editReply({ content: 'There was an error opening the ticket. Please try again later.'});
    const ticketObject = await TicketManager.startTicket(interaction);
    const ticket = ticketObject.cachedInstance;

    const ticketChannel = await interaction.guild.channels.cache.filter(c => c.name === 'tech-tickets').first();
    
    const attachmentInquiry = interaction.options.getBoolean('attachment');

    const processTicket = () => {
        if (ticketChannel && attachmentInquiry) ticketReachout(0);
        else if (ticketChannel && !attachmentInquiry) ticketReachout(1);
        else if (!ticketChannel) ticketReachout(404);
    }

    const ticketReachout = (questionSet) => {
        if (questionSet === 404) {
            interaction.reply({ content: 'Tech tickets are not enabled on this server. Contact an administrator if you believe this is an error.' });
            return;
        }
        if (questionSet === 0) {
            interaction.reply({ content: `Please begin the ticket process in ${/*reachoutMethod*/ null}`, ephemeral: true });
            return;
        }
        if (questionSet === 1) {
            interaction.reply({ content: `Please begin the ticket process in ${/*reachoutMethod*/ null}`, ephemeral: true });
            createThread()
            return;
        }
    }

    const reachoutMethod = async () => {
        const userOfInterest = ticket.author;

        try {
            const dmChannel = await userOfInterest.createDM();
            dmChannel.send({ content: `Hello`, ephemeral: true });
        } catch (e) {console.log(e)}


    }
    
    const createThread = async () => {
        const threads = ticketChannel.threads
        
        const ticketThread = await threads.create({
            name: `Tech Ticket #${ticket.id}`,
            autoArchiveDuration: 60,
            reason: `Tech Ticket thread created for ${ticket.author.username}`,
          })
         .catch(console.error);
    }
    const threadListener = async () => {}
    
    const createDM = async () => {}
    const dmListener = async () => {}


    
    const closeTicket = () => {}


    processTicket()
    reachoutMethod()
}
}