const Discord = require('discord.js');

module.exports = {
    name: 'userindex',
    description: "Search all of Discord for a user",
    options: [{
        name: 'userid',
        type: 'USER',
        description: 'The user\'s userid (in snowflake form)',
        required: true,

    },
    {
        name: 'purgetime',
        type: 'INTEGER',
        description: 'The amount of days to purge messages the banned user, if any',
        required: false,
        choices: [
            {
                name: 'one',
                value: 1,
            },
            {
                name: 'two',
                value: 2,
            },
            {
                name: 'three',
                value: 3,
            },
            {
                name: 'four',
                value: 4,
            },
            {
                name: 'five',
                value: 5,
            },
            {
                name: 'six',
                value: 6,
            },
            {
                name: 'seven',
                value: 7,
            },
        ]

    },
    {
        name: 'reason',
        type: 'STRING',
        description: 'Reason for banning the user, if any',
        required: false,

    }],
    defaultPermission: false,
    permissions: [{
        id: '146719098343129088',
        type: 'ROLE',
        permission: true, 
    }],
    async execute(interaction, client) {

        await interaction.defer({ ephemeral: true });

        console.log(interaction.options);
        let inputDays;
        let inputReason;
        
        const inputID = await interaction.options.get('userid').value;
        if (interaction.options.has('purgetime')) {
            inputDays = await interaction.options.get('purgetime').value;
        }
        if (interaction.options.has('reason')) {
            inputReason = await interaction.options.get('reason').value;
        }

        let user; 
        
        const banEmoji = '🔨';
        const warnEmoji = '⚠️';
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
                        
    async function registerInteraction(executor, user, action, reason, purge) {
        const registryEmbed = new Discord.MessageEmbed()
            .setColor('#00ff00')
            .setAuthor(`${user.tag}`, user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: 'Action:', value: `\`\`\`The user has been ${action}\`\`\`` },
            )
            .setFooter(executor.tag, executor.displayAvatarURL({ dynamic: true }))
            .setTimestamp()

        if (reason) registryEmbed.addField('Reason:',`\`\`\`${reason}\`\`\``);
        if (purge) registryEmbed.addField('Amount of days for message purge:', `\`\`\`${purge}\`\`\``);
        
        interaction.editReply({ embeds: [registryEmbed], components: [] });
        const registryChannel = interaction.guild.channels.cache.find(ch => ch.name === 'guild-logs');
        registryChannel.send({content: `Interaction log resulting in a ${action} user ${user.tag} \nAction was executed by ${interaction.user.tag}`, embed: registryEmbed });

    }

        try {
                user = await client.users.fetch(inputID, true)
                const userInfo = new Discord.MessageEmbed()
                    .setColor('#f6c5f8')
                    .setAuthor(`${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                    .addFields(
                        { name: 'Requested ID:', value: inputID },
                        { name: 'Fetched ID:', value: user.id },
                        { name: 'Account Creation Date:', value: user.createdAt.toString() },
                        { name: 'Mod Notes:', value: 'placeholder'  }
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
                        if (!inputReason && !inputDays) {
                            await interaction.guild.members.ban(inputID)
                            .then(console.log)
                            .catch(console.error)
                        } else if (inputReason && !inputDays) {
                            await interaction.guild.members.ban(inputID, { reason: inputReason })
                            .then(console.log)
                            .catch(console.error)
                        } else if (!inputReason && inputDays) {
                            await interaction.guild.members.ban(inputID, { days: inputDays })
                            .then(console.log)
                            .catch(console.error)
                        } else if (inputReason && inputDays) {
                            await interaction.guild.members.ban(inputID, { days: inputDays, reason: inputReason })
                            .then(console.log)
                            .catch(console.error)
                        }

                        // Then create a log
                        registerInteraction(interaction.user, user, 'banned', inputReason, inputDays)
                    break;

                    case 'redwarnuser':
                        console.log(`You clicked ${interaction.customID}`);
                    break;

                }
			});

		    collector.on('end', collected => {
                
                console.log(`The collecter has ended its collection round, and collected ${collected.size} items`)

            });
                                   
            } catch(error) {
                console.log(error)
            }
    }
    
}