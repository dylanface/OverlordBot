module.exports = {
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
    const ticket = await TicketManager.startTicket(interaction);
    console.log(ticket)

    const ticketChannel = await interaction.guild.channels.cache.filter(c => c.name === 'tech-tickets').first();
    
    const attachmentInquiry = interaction.options.getBoolean('attachment');

    const openTicket = () => {
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
            return;
        }
    }

    const reachoutMethod = () => {}
    
    const createThread = async () => {}
    const threadListener = async () => {}
    
    const createDM = async () => {}
    const dmListener = async () => {}


    
    const closeTicket = () => {}


    openTicket()
}
}