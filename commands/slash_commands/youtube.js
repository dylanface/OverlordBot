module.exports = {
    name: 'youtube',
    description: "Watch youtube videos with the help of Discord-Together!",
    async execute(interaction, client) {
        await client.discordTogether.createTogetherCode(interaction.member.voice.channelID, 'youtube').then(async invite => {
            return interaction.channel.send(`${invite.code}`);
        });
    }
}



