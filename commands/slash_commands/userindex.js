const Discord = require('discord.js');

module.exports = {
    enabled: true,
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
        await interaction.member.guild.channels.fetch(null, {cache:true});
        
        const { id:inputId } = interaction.options.getUser('userid');
        if (interaction.options.getInteger('purgetime')) {
            var inputDays = await interaction.options.getInteger('purgetime');
            console.log(inputDays)
        }
        if (interaction.options.getString('reason')) {
            var inputReason = await interaction.options.getString('reason');
            console.log(inputReason)
        }
        
        const banEmoji = '🔨';
        const warnEmoji = '⚠️';
        const noteEmoji = '📒';
        const cancelEmoji = '❌';

        const cancelButtonPr = [
            new Discord.MessageButton()
            .setCustomId('cancel')
            .setLabel(`${cancelEmoji} Cancel`)
            .setStyle('SECONDARY')
        ]

        const row = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('banuser')
                    .setLabel(`${banEmoji} Ban User`)
                    .setStyle('PRIMARY'),
                // new Discord.MessageButton()
                //     .setCustomId('warnuser')
                //     .setLabel(`${warnEmoji} Warn User`)
                //     .setStyle('PRIMARY'),
                // new Discord.MessageButton()
                //     .setCustomId('makenote')
                //     .setLabel(`${noteEmoji} Mod Note on User`)
                //     .setStyle('PRIMARY'), 
                    cancelButtonPr,
                    
        );
                    
        const banSelect = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('redbanuser')
                    .setLabel(`${banEmoji} Are You Sure?`)
                    .setStyle('DANGER'),
                    cancelButtonPr,
                    
            );

        const warnSelect = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                    .setCustomId('redwarnuser')
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
        
        try {
            interaction.editReply({ embeds: [registryEmbed], components: [] });
            const registryChannel = await interaction.member.guild.channels.cache.find(channel => channel.name === 'guild-logs');
            registryChannel.send({ embeds: [registryEmbed] });

        } catch {
            console.log('Failed to send registry message');
        }

    }

        try {
            var user = await client.users.fetch(inputId, true)
            const userInfo = new Discord.MessageEmbed()
                .setColor('#f6c5f8')
                .setAuthor(`${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'Requested Id:', value: inputId },
                    { name: 'Fetched Id:', value: user.id },
                    { name: 'Account Creation Date:', value: user.createdAt.toString() }
                )
        
            await interaction.editReply({embeds: [userInfo], components: [row] });
            const channelId = interaction.channelId;
            const channel = await interaction.member.guild.channels.fetch(channelId);

		    const filter = interaction => interaction.customId === 'banuser' || 'warnuser' || 'makenote' || 'cancel';
		    const collector = channel.createMessageComponentCollector({filter, componentType: 'BUTTON'});

            collector.on('collect', async interaction => {
                if (!interaction.isButton()) return;
                // else await interaction.deferUpdate({ ephemeral: true });

                switch (interaction.customId) {

                    case 'banuser':
                        await interaction.editReply({ embeds: [userInfo], components: [] });
                        await interaction.editReply({ embeds: [userInfo], components: [banSelect] });
                    break;

                    case 'warnuser':
                        await interaction.editReply({ embeds: [userInfo], components: [] });
                        await interaction.editReply({ embeds: [userInfo], components: [warnSelect] });
                    break;

                    case 'makenote':
                        await interaction.editReply({ embeds: [userInfo], components: [] });
                    break;

                    case 'cancel':
                        await interaction.editReply({ content:'All actions canceled, the user has been added to the cache.',  components: [], embeds: [] });
                        collector.stop()
                    break;

                    case 'redbanuser':
                        if (!inputReason && !inputDays) {
                            await interaction.guild.members.ban(inputId)
                            .then(console.log)
                            .catch(console.error)
                        } else if (inputReason && !inputDays) {
                            await interaction.guild.members.ban(inputId, { reason: inputReason })
                            .then(console.log)
                            .catch(console.error)
                        } else if (!inputReason && inputDays) {
                            await interaction.guild.members.ban(inputId, { days: inputDays })
                            .then(console.log)
                            .catch(console.error)
                        } else if (inputReason && inputDays) {
                            await interaction.guild.members.ban(inputId, { days: inputDays, reason: inputReason })
                            .then(console.log)
                            .catch(console.error)
                        }

                        // Then create a log
                        registerInteraction(interaction.user, user, 'banned', inputReason, inputDays)
                        collector.stop()
                    break;

                    case 'redwarnuser':
                        console.log(`You clicked ${interaction.customId}`);
                    break;

                }
			});

		    collector.on('end', collected => {
                
                console.log(`The collecter has ended its collection round, and collected ${collected.size} items`)

            });
                                   
            } catch(error) {
                console.log(`Something went wrong when fetching the user`);
            }
    }
    
}