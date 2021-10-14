const Discord = require('discord.js');
const { bold, italic, strikethrough, underscore, spoiler, quote, blockQuote, inlineCode, codeBlock  } = require('@discordjs/builders');

module.exports = {
    name: 'massban',
    description: "Begin the mass ban process for a list of Users",
    options: [{
        name: 'userlist',
        type: 'STRING',
        description: 'Comma separated user id list',
        required: true,
    }],
    async execute(interaction, client) {

        await interaction.deferReply();
        await interaction.member.guild.channels.fetch(null, {cache:true});

        const inputUserList = await interaction.options.getString('userlist');
        
        const formatUserList = async (userList) => {
            let replaceOp = userList.replace(/[^0-9,]/g,'');
            let userListArray = replaceOp.split(',');
            const filteredArray = userListArray.filter(user => { return user.length >= 17 && user.length <= 19 });

            let i=0
            for (let userId of filteredArray) {
                try {
                    await client.users.fetch(userId, true)
                } catch (error) {
                    filteredArray.splice(i, 1);
                    console.log(filteredArray);
                }
                i++
            }

            let formattedUserList = {
                userListArray: filteredArray,
                userListLength: filteredArray.length,
            }
            console.log(formattedUserList)

            
            return formattedUserList;
        }

        const { userListArray, userListLength } = await formatUserList(inputUserList);

        const establishDefaultReason = async (interaction) => {

            const reasonSelector = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageSelectMenu()
                .setCustomId('massban_reason_selector')
                .setPlaceholder('Select a default reason for this operation')
                .addOptions([
                    {
                        label: 'Banned by Streamer Friend',
                        value: 'Harassing a streamer',
                    },
                    {
                        label: 'Bots | Alternative Accounts',
                        value: 'Botting or avoiding punishments',
                    },
                    {
                        label: 'Hate Speech',
                        value: 'Discriminating against race, national origin, religious affiliation, gender or sexual orientation.',
                    },
                    {
                        label: 'Child Endangerment',
                        value: 'Harassing and/or endangering a minor using Discord',
                    },
                    {
                        label: 'Reason Not Specified',
                        value: 'null',
                    }
                    
    
                ])
            )
            
            const massBanEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Mass Ban')
            .setDescription(`Select default reason for banning (${userListLength}) users:`)
                
            interaction.editReply({ embeds: [massBanEmbed], components: [reasonSelector] });
    
            const channelId = interaction.channelId;
            const channel = await interaction.member.guild.channels.fetch(channelId);
    
            const defaultReasonFilter = interaction => interaction.customId === 'massban_reason_selector';
            const defaultReasonCollector = channel.createMessageComponentCollector({filter: defaultReasonFilter, componentType: 'SELECT_MENU'});
    
                defaultReasonCollector.on('collect', async interaction => {
                    if (!interaction.isSelectMenu()) return;
                    else await interaction.deferUpdate({ ephemeral: true });
    
                    console.log(interaction.values)

                    createUserList(interaction, interaction.values);
                    defaultReasonCollector.stop();
                });
        }


        const userListGeneratedEmbeds = new Discord.Collection();
        const createUserEmbed = async (userId, reason) => {
            const user = await client.users.fetch(userId, true)
            if (reason === 'pardon') {
                const userPardonEmbed = new Discord.MessageEmbed()
                    .setColor(user.hexAccentColor)
                    .setAuthor(`${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`${user.tag} is currently pardoned from this ban list. Edit reason, or click Pardon User again to re-add.`)
                userListGeneratedEmbeds.set(userId, userPardonEmbed);
            } else {
                const userEmbed = new Discord.MessageEmbed()
                .setColor(user.hexAccentColor)
                .setAuthor(`${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'User Id', value: `${user.id}`, inline: true },
                    { name: 'Discord Bot', value: `${user.bot ? 'This user is not a registered bot' : 'This user is registered as a bot'}`, inline: true },
                    { name: 'Reason', value: `${reason}`, inline: false },
                    { name: 'Account Created', value: `${user.createdAt}`, inline: true },
                    { name: 'Account Age', value: `${Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))} days`, inline: true },
                )

                userListGeneratedEmbeds.set(user.id, userEmbed);
            }

            
        }

        
        const createActionRow = (backDisabled, nextDisabled) => {
            
            const backButton = new Discord.MessageButton()
                .setCustomId('back')
                .setLabel('Back')
                .setStyle('SECONDARY')
                .setDisabled(backDisabled)
    
            const nextButton = new Discord.MessageButton()
                .setCustomId('next')
                .setLabel(`Next`)
                .setStyle('SECONDARY')
                .setDisabled(nextDisabled)

            const userListActionButtons = new Discord.MessageActionRow()
            .addComponents(
                backButton,
                nextButton,
                new Discord.MessageButton()
                    .setCustomId('pardon')
                    .setLabel(`Pardon User`)
                    .setStyle('PRIMARY'),
                new Discord.MessageButton()
                    .setCustomId('edit_reason')
                    .setLabel(`Edit Reason for User`)
                    .setStyle('DANGER'),
                new Discord.MessageButton()
                    .setCustomId('continue')
                    .setLabel(`Continue to review`)
                    .setStyle('SUCCESS')
            )

            return userListActionButtons;
        }

        const createUserList = async (interaction, reason) => {
            const userListOperations = new Discord.Collection();

            for (let user of userListArray) {
                await createUserEmbed(user, reason)
            }

            const userListEmbed = userListGeneratedEmbeds.get(userListArray[0]);
            
            interaction.editReply({ embeds: [userListEmbed], components: [createActionRow(true, false)] });
            
            let iterator = 0;
            const channelId = interaction.channelId;
            const channel = await interaction.member.guild.channels.fetch(channelId);
    
            const userActionButtonFilter = interaction => interaction.customId === 'back' || 'next' || 'pardon' || 'edit_reason';
            const userActionButtonCollector = channel.createMessageComponentCollector({filter: userActionButtonFilter, componentType: 'BUTTON'});
            
                userActionButtonCollector.on('collect', async (interaction) => {
                    if (!interaction.isButton()) return;
                    else await interaction.deferUpdate();

                    switch (interaction.customId) {
                        case 'back':
                            if (iterator > 1) {
                                const embed = userListGeneratedEmbeds.get(userListArray[--iterator]);
                                interaction.editReply({ embeds: [embed], components: [createActionRow(false, false)] });
                            } else {
                                const embed = userListGeneratedEmbeds.get(userListArray[--iterator]);
                                interaction.editReply({ embeds: [embed], components: [createActionRow(true, false)] });
                            } 
                        break;

                        case 'next':
                            if (iterator < (userListArray.length - 1) - 1) {
                                const embed = userListGeneratedEmbeds.get(userListArray[++iterator]);
                                interaction.editReply({ embeds: [embed], components: [createActionRow(false, false)] });
                            } else {
                                const embed = userListGeneratedEmbeds.get(userListArray[++iterator]);
                                interaction.editReply({ embeds: [embed], components: [createActionRow(false, true)] });
                            } 
                        break;

                        case 'pardon':
                            if (userListOperations.get(userListArray[iterator]) === 'pardon') {
                                await createUserEmbed(userListArray[iterator], reason)
                                .then(() => {
                                    const embed = userListGeneratedEmbeds.get(userListArray[iterator]);
                                    interaction.editReply({ embeds: [embed] });
                                    userListOperations.set(userListArray[iterator], reason);
                                })
                            } else {
                                await createUserEmbed(userListArray[iterator], 'pardon')
                                .then(() => {
                                    const embed = userListGeneratedEmbeds.get(userListArray[iterator]);
                                    interaction.editReply({ embeds: [embed] });
                                    userListOperations.set(userListArray[iterator], 'pardon');
                                })
                            }
                        break;

                        case 'edit_reason':
                            interaction.followUp({ embeds: [new Discord.MessageEmbed().setDescription('Enter new reason for banning:')]}).then((prompt => {
                                const filter = message => message.author.id === interaction.member.id;
                                interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] })
                                .then(async (collected) => {
                                    await createUserEmbed(userListArray[iterator], collected.first().content)
                                    .then(() => {
                                        const embed = userListGeneratedEmbeds.get(userListArray[iterator]);
                                        interaction.editReply({ embeds: [embed] });
                                        userListOperations.set(userListArray[iterator], collected.first().content);
                                        prompt.delete();
                                        collected.first().delete();
                                    })
                                })
                                .catch(collected => {
                                    console.log(`There has been a an error while editing`)
                                });
                            }))
                        break;

                        case 'continue':
                            for (let userId of userListArray) {
                                if (userListOperations.has(userId)) {
                                    continue;
                                } else {
                                    userListOperations.set(userId, reason);
                                }
                            }
                            interaction.editReply({ embeds: [createOperationSummary(userListOperations)], components: [] })
                            userActionButtonCollector.stop();
                        break;
                    }
                });

        }

        const createOperationSummary = (operations) => {

            const operationSummaryEmbed = new Discord.MessageEmbed()
                .setAuthor(`Operation Summary`, client.user.displayAvatarURL({ dynamic: true }))
                .setDescription(codeBlock('diff', `${operations.map((value, key) => {
                    if (value === 'pardon') return `+ ${key} will be pardoned`;
                    else return `- ${key} will be banned for ${value}`;
                }).join(`\n\n`)}`))

            return operationSummaryEmbed;
        }

        // Call the reason function to embed the reason selector and information
        establishDefaultReason(interaction);

    }
} //FIXME I want more Anchors