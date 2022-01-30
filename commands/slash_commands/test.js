const DiscordUser = require('../../components/DiscordUser')

module.exports = {
name: 'test',
description: 'Test command',
async execute(interaction, client) {
    await interaction.deferReply();

    const user = interaction.member.user;

    const testPost = new DiscordUser(user)
    await testPost.post()

    await interaction.editReply(`${user.username}'s test post has been posted`);

}
}