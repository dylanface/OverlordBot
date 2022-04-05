const Discord = require('discord.js');

module.exports = {
name: 'list_ban',
description: 'Ban a list of user Ids from the Guild',
options: [
    {
        name: 'ids',
        type: 'STRING',
        description: 'The comma seperated list of user Ids to ban',
        required: true,
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
    }
],
async execute(interaction, client) {

    await interaction.deferReply({ ephemeral: true });

    const idList = await interaction.options.getString('ids');
    const idArray = idList.split(',');

    const logChannel = interaction.guild.channels.cache.find(channel => channel.name === 'guild-logs');
    const bannedUsers = [];

    for (const id of idArray) {
        const user = await client.users.fetch(id, true)
        .catch(console.log);

        if (user === undefined || !user.id) continue;
        
        await interaction.guild.members.ban(user.id, { reason: `Banned by ${interaction.member.user.tag} in a list ban execution`})
        .then(console.log)
        .catch(console.error);

        bannedUsers.push(user);
    }

    const embed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setDescription(`Banned ${bannedUsers.length} users`)
        .addField('Banned Users', `\`\`\`${bannedUsers.map(user => user.tag).join('\n')}\`\`\``)
        .setFooter({text: interaction.member.user.tag, iconURL: interaction.member.user.avatarURL()})
        .setTimestamp();

    await logChannel.send({ embeds: [embed] });

    await interaction.editReply(`Banned ${bannedUsers.length} users`);
}
}