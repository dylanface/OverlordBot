module.exports = {
    name: 'clearchat',
    description: "This can clear the channel you execute the command in",
    guildOnly: "true",
    cooldown: 5,
    async execute(client, message, args, Discord) {
        if (!args[0]) return message.reply('Error, please define second argument')
        message.channel.bulkDelete(args[0]);

    }
}