const Discord = require('discord.js');

module.exports = {
    name: 'userindex',
    description: "Search all of Discord for a user",
    options: {
        name: 'userid',
        type: 'USER',
        description: 'The user\'s userid (in snowflake form)',
        required: true,
    },
    async execute(interaction, client) {

        await interaction.defer({ ephemeral: true });

        const inputID = await interaction.options.get('userid').value;
        let user;

        const banEmoji = '🔨';
        const warnEmoji = '⚠️';
        const kickEmoji = '🥾';
        const noteEmoji = '📒';
        
        const cancelEmoji = '❌';

        const cancelButtonPr = [
            new Discord.MessageButton()
            .setCustomID('cancel')
            .setLabel(`${cancelEmoji} Cancel`)
            .setStyle('SECONDARY')
        ]

        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomID('banuser')
                    .setLabel(`${banEmoji} Ban User`)
                    .setStyle('PRIMARY'),
                new Discord.MessageButton()
                    .setCustomID('warnuser')
                    .setLabel(`${warnEmoji} Warn User`)
                    .setStyle('PRIMARY'),
                new Discord.MessageButton()
                    .setCustomID('makenote')
                    .setLabel(`${noteEmoji} Mod Note on User`)
                    .setStyle('PRIMARY'), 
                cancelButtonPr,
                    
            );
            
            const banSelect = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomID('redbanuser')
                    .setLabel(`${banEmoji} Are You Sure?`)
                    .setStyle('DANGER'),
                cancelButtonPr,

            );

            const warnSelect = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomID('redwarnuser')
                    .setLabel(`${warnEmoji} Are You Sure?`)
                    .setStyle('DANGER'),
                cancelButtonPr,

            );

            try {
                user = await client.users.fetch(inputID, true)
                const userInfo = new Discord.MessageEmbed()
                    .setColor('#f6c5f8')
                    .setAuthor(`${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: 'Requested ID:', value: inputID },
                        { name: 'Fetched ID:', value: user.id },
                        { name: 'Account Creation Date:', value: user.createdAt.toString() },
                        { name: 'Mod Notes:', value: 'holder'  }
                    )

                await interaction.editReply({embeds: [userInfo], components: [row] });

            const channel = interaction.channel;
		    const filter = interaction => interaction.customID === 'banuser' || 'warnuser' || 'makenote' || 'cancel';

		    const collector = channel.createMessageComponentInteractionCollector(filter, { time: 30000 });

            collector.on('collect', async interaction => {

                switch (interaction.customID) {

                    case 'banuser':
                        await interaction.update({ embeds: [userInfo], components: [] });
                        await interaction.editReply({ embeds: [userInfo], components: [banSelect] });
                    break;

                    case 'warnuser':
                        await interaction.update({ embeds: [userInfo], components: [] });
                        await interaction.editReply({ embeds: [userInfo], components: [warnSelect] });
                    break;

                    case 'makenote':
                        await interaction.update({ embeds: [userInfo], components: [] });
                    break;

                    case 'cancel':
                        await interaction.update(('All actions canceled, the user has been added to the cache.'), { components: [] });
                        
                    break;

                    case 'redbanuser':
                            interaction.guild.members.ban(inputID)
                            console.log(`${interaction.user} has banned ${inputID}`)
                    break;

                    case 'redwarnuser':
                        console.log(`You clicked ${interaction.customID}`);
                    break;

                }
			});

		    collector.on('end', collected => console.log(`Collected ${collected.size} items`));

                                   
            } catch(error) {
                console.log(error)
            }
    }
    
}