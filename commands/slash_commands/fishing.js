module.exports = {
    name: 'fishing',
    description: "Play the fishing embedded voice channel game with the help of Discord-Together!",
    async execute(interaction, client) {

        if (interaction.member.voice.channel) {

            await client.discordTogether.createTogetherCode(interaction.member.voice.channelId, 'fishing').then(async invite => {
                return interaction.reply(`<${invite.code}> ← Click Me!`);
            });
        } else {
            interaction.reply('You must be in a voice channel to use this command!');
        }
    }
}
