module.exports = {
name: 'sort_game_reactions',
description: 'Remove reactions for users who are not present in your voice channel',
options: [
    {
        name: 'post_id',
        description: 'The id of the post to sort reactions on',
        type: 'STRING',
        required: true
    }
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

    await interaction.deferReply({ ephemeral: true });

    if (!interaction.member.voice.channel /*|| interaction.member.voice.channel.members.size < 2*/) return interaction.editReply('You must be in a populated voice channel to use this command.');

    const voiceChannel = interaction.member.voice.channel;

    const postChannel = interaction.channel;
    const postId = await interaction.options.getString('post_id');

    const presentUsers = voiceChannel.members.map(member => member.user.id);
    const post = await postChannel.messages.fetch(postId);

    if (!post.reactions) return interaction.editReply('This post has no reactions.');

    const reactions = await post.reactions.cache;
    if (reactions.size < 1) return interaction.editReply('This post has no reactions.');
    for (let reaction of reactions.values()) {
        const reactionUsers = await reaction.users.fetch();
        const reactionUserIds = reactionUsers.map(user => user.id);
        const missingUsers = reactionUserIds.filter(userId => !presentUsers.includes(userId));
        if (missingUsers.length > 0) {
            for (let missingUserId of missingUsers) {
                await reaction.users.remove(missingUserId);
            }
        }
    }


    await interaction.editReply('Reactions sorted.');

    



}
}