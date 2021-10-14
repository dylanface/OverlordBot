module.exports = {
    name: 'youtube',
    description: "Watch youtube videos with the help of Discord-Together!",
    async execute(interaction, client) {

        if (interaction.member.voice.channel) {
            await client.discordTogether.createTogetherCode(interaction.member.voice.channelId, 'youtube').then(async invite => {
                return interaction.reply(`<${invite.code}> ← Click Me!`);
            });
        } else {
            interaction.reply('You must be in a voice channel to use this command!');
        }
    }
}



