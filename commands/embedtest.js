module.exports = {
    name: 'embed',
    description: "embeds!",
    execute(client, message, args, Discord) {
        const newEmbed = new Discord.MessageEmbed()
        .setColor('#f9b7f2')
        .setTitle('Test Embed')
        .setURL('https://www.disciplesofosiris.net/')
        .setDescription('This is a test embed')
        .addFields(
            {name: 'Field 1', value: 'fuck you'},
            {name: 'Field 2', value: 'fuck you'},
            {name: 'Field 3', value: 'fuck you'},
        )
        .setImage('https://static-2.gumroad.com/res/gumroad/7207907956925/asset_previews/67b50f4e010fb46fcfa94f55188d898f/retina/logo.png')
        .setFooter('big time');

        message.channel.send(newEmbed);
    }

}