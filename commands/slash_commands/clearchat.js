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
    {
        name: 'test_threads',
        type: 'BOOLEAN',
        description: 'You wanna fucken delete the fucken threads or not ?',
        required: false,
    },
    ],
    defaultPermission: false,
	permissions: [
        {
			id: '146719098343129088',
			type: 'ROLE',
			permission: true,
	    },
        {
            id: '265023187614433282',
            type: 'USER',
            permission: true,
        },
        {
			id: '956794393598238791',
			type: 'ROLE',
			permission: true,
	    }
    ],
    async execute(interaction, client) {
        
        
        if (interaction.options.get('input')) {
            
            const { value: input } = interaction.options.get('input');
            interaction.channel.bulkDelete(input).catch(error => console.log(error))
            interaction.reply(`${input} messages have been deleted`, { ephemeral: true })
        } else if (interaction.options.get('bot_messages')){
            
            const clearChannel = interaction.channel;
            const messages = await clearChannel.messages.fetch({ limit: interaction.options.get('bot_messages').value })
            messages.forEach(msg => {if(msg.author.bot)msg.delete()} )

            interaction.reply(`${interaction.options.get('bot_messages').value} messages have been deleted`, { ephemeral: true })

            // interaction.channel.bulkDelete(messages).catch(error => console.log(error))
        } else if (interaction.options.get('test_threads')){
            const channelManager = interaction.guild.channels.cache
            .filter(channel => channel.isThread() && channel.name.includes('TicTacToe'))
            .each(channel => channel.delete())
            interaction.reply(`${channelManager.size} Threads have been deleted`, { ephemeral: true })

        } else {
            console.log('nothing deleted')
        }
        
    }
}