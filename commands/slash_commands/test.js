const DiscordUser = require('../../components/DiscordUser')

module.exports = {
name: 'test',
description: 'Test command',
options: [
    {
        name: 'as',
        description: 'The user to test as',
        type: 'USER',
        required: false
    }
],
async execute(interaction, client) {
    await interaction.deferReply();

    if (interaction.options.getUser('as') != null) {
        var user = interaction.options.getUser('as');
        var reply = `Executed as ${user.username}`;
    } else {
        var user = interaction.member.user;
        var reply = `Executed as ${user.username}`;
    }


    const testPost = new DiscordUser(user)

    await interaction.editReply(reply);

    setTimeout(async () => {
        testPost.save()
        await interaction.deleteReply()
    }, 5000);

}
}