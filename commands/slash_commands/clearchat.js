module.exports = {
    name: 'clearchat',
    description: "This can clear the channel you execute the command in",
    options: [ 
    {
        name: 'input',
        type: 'INTEGER',
        description: 'The number of messages to clear',
        required: false,
    },
    {
        name: 'bot_messages',
        type: 'INTEGER',
        description: 'The number of bot messages to clear',
        required: false,
    },
],
    // defaultPermission: true,
    // permissions: [{
    //     id: '146719098343129088',
    //     type: 'ROLE',
    //     permission: true, 
    // }],
    async execute(interaction, client) {
        
        
        if (interaction.options.get('input')) {
            
            const { value: input } = interaction.options.get('input');
            interaction.channel.bulkDelete(input).catch(error => console.log(error))
            interaction.reply(`${input} messages have been deleted`, { ephemeral: true })
        } else if (interaction.options.get('bot_messages')){
            
            const clearChannel = interaction.channel;
            const messages = await clearChannel.messages.fetch({ limit: interaction.options.get('bot_messages').value })
            messages.forEach(msg => {if(msg.author.bot)msg.delete()} )

            // interaction.channel.bulkDelete(messages).catch(error => console.log(error))
            // interaction.reply(`100 messages have been deleted`, { ephemeral: true })
        } else {
            console.log('nothing deleted')
        }
        
    }
}