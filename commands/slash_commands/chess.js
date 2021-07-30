module.exports = {
    name: 'chess',
    description: "Play Chess in the Park with the help of Discord-Together!",
    async execute(interaction, client) {

        if (interaction.member.voice.channel) {

            await client.discordTogether.createTogetherCode(interaction.member.voice.channelID, 'chess').then(async invite => {
                return interaction.reply(`<${invite.code}> ← Click Me!`);
            });
        } else {
            interaction.reply('You must be in a voice channel to use this command!');
        }
    }
}
