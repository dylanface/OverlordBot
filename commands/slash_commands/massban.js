const Discord = require('discord.js');
const { codeBlock  } = require('@discordjs/builders');

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

        await interaction.deferReply(/*{ ephemeral: true }*/);
        // await interaction.guild.channels.fetch(null, {cache:true});

        const guild = interaction.guild
        const channel = await interaction.member.guild.channels.fetch(interaction.channelId);
        const guildLogChannel = await guild.channels.cache.find(channel => channel.name === 'guild-logs');

        const inputUserList = await interaction.options.getString('userlist');
        

        /**
         * Format the raw user list into an array of userObjects.
         * @param { String } userList Comma separated list of user ids to be parsed.
         */
        const formatUserList = async (userList) => {
            let replaceOp = userList.replace(/[^0-9,]/g,'');
            let userListArray = replaceOp.split(',');
            const filteredArray = userListArray.filter(user => { return user.length >= 17 && user.length <= 20 });

            let i=0
            for (let userId of filteredArray) {
                const user = await client.users.fetch(userId, true).catch(console.error)

                if (user) {
                    filteredArray[i] = {id: user.id, user: user}
                    i++
                    continue
                } else {
                    filteredArray.splice(i, 1);
                    console.log(filteredArray);
                    continue
                }
                
            }

            let formattedUserList = {
                /**
                 * @type { Array<{id: String, user: Discord.User}> }
                 */
                userListArray: filteredArray,
                userListLength: filteredArray.length,
            }
            console.log(formattedUserList)

            
            return formattedUserList;
        }

        /**
         * Generate the formatted user list array globally.
        */
        const { userListArray, userListLength } = await formatUserList(inputUserList);

        /**
         * End the mass ban process if the user list includes less than 3 userObjects.
         */
        if (userListLength <= 2) return await interaction.editReply(`Mass ban requires at least 3 suspected users.`);


        /**
         * Send and watch the default reason selector to begin the mass ban process.
         * @param {Discord.CommandInteraction} interaction The command interaction that began this mass ban.
         */
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
    
            const defaultReasonFilter = i => i.customId === 'massban_reason_selector' && i.user.id === interaction.member.user.id;
            const defaultReasonCollector = channel.createMessageComponentCollector({filter: defaultReasonFilter, componentType: 'SELECT_MENU'});
    
                defaultReasonCollector.on('collect', async interaction => {
                    if (!interaction.isSelectMenu()) return;
                    else await interaction.deferUpdate({ ephemeral: true });
    
                    console.log(interaction.values)

                    createUserList(interaction, interaction.values);
                    defaultReasonCollector.stop();
                });
        }


        /**
         * A collection of embeds generated for the user list.
         */
        const userListGeneratedEmbeds = new Discord.Collection();

        /**
         * Turn an object from the user list and a reason into an embed.
         * @param { Object } userObject The object passed from the user list.
         * @param { String } reason The reason for the ban.
         */
        const createUserEmbed = async (userObject, reason) => {
            const user = userObject.user;
            if (reason === 'pardon') {
                const userPardonEmbed = new Discord.MessageEmbed()
                    .setColor(user.hexAccentColor)
                    .setAuthor(`${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`${user.tag} is currently pardoned from this ban list. Edit reason, or click Pardon User again to re-add.`)
                userListGeneratedEmbeds.set(userObject.id, userPardonEmbed);
            } else {
                const userEmbed = new Discord.MessageEmbed()
                .setColor(user.hexAccentColor)
                .setAuthor(`${user.tag}`, user.displayAvatarURL({ dynamic: true }))
                .addFields(
                    { name: 'User Id', value: `${user.id}`, inline: true },
                    { name: 'Discord Bot', value: `${user.bot ? 'This user is registered as a bot' : 'This user is not a registered bot' }`, inline: true },
                    { name: 'Reason', value: `${reason}`, inline: false },
                    { name: 'Account Created', value: `${user.createdAt}`, inline: true },
                    { name: 'Account Age', value: `${Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24))} days`, inline: true },
                )

                userListGeneratedEmbeds.set(userObject.id, userEmbed);
            }

            
        }

        /**
         * Create action row for operation summary confirmation.
         */
        const confirmActionRow = () => {

            const confirmationButtons = new Discord.MessageActionRow()
            .addComponents(
                new Discord.MessageButton()
                .setCustomId('confirm_button')
                .setLabel('Confirm')
                .setStyle('SUCCESS'),
                new Discord.MessageButton()
                .setCustomId('cancel_button')
                .setLabel('Cancel')
                .setStyle('DANGER')

            )

            return confirmationButtons
        }


        /**
         * Listener for operation summary confirmation.
         * @param {Discord.Collection} operations The operations of interest.
         */
        const listenForConfirmation = async (operations) => {

            const confirmationFilter = i => i.customId === 'confirm_button' || 'cancel_button' && i.user.id === interaction.member.user.id;
            const userActionButtonCollector = channel.createMessageComponentCollector({filter: confirmationFilter, componentType: 'BUTTON'});
            
                userActionButtonCollector.on('collect', async (interaction) => {
                    if (!interaction.isButton()) return;
                    else await interaction.deferUpdate();

                    if (interaction.customId === 'confirm_button') {
                        await executeBanList(operations);
                        userActionButtonCollector.stop();
                        
                        const confirmationEmbed = new Discord.MessageEmbed()
                        .setColor('#0099ff')
                        .setDescription(`Actions are being executed... Check <#${guildLogChannel.id}> for logs.`)

                        await interaction.editReply({ embeds: [confirmationEmbed], components: [] });
                    }
                    if (interaction.customId === 'cancel_button') {
                        userActionButtonCollector.stop();

                        const cancelEmbed = new Discord.MessageEmbed()
                        .setColor('#ff0000')
                        .setDescription('Cancelled mass ban operation, no action(s) will be executed.')

                        await interaction.editReply({ embeds: [cancelEmbed], components: [] });

                    }

                });

        }


        /**
         * Execute the bans as detailed in the operations collection.
         * @param {Discord.Collection} operations The operations collection to execute.
         */
        const executeBanList = async (operations) => {
            const bannedUsers = [];
            for (let [key, value] of operations) {
                if (value != 'pardon') {
                    if (value === 'null') value = `Banned by ${interaction.member.user.tag} with mass ban`;

                    await guild.members.ban(key, { reason: value })
                    .then(console.log)
                    .catch(console.error)

                    bannedUsers.push(key);

                    const event = {
                        type: 'banned',
                        suspectId: key,
                        moderator: interaction.member,
                        reason: value,
                    }

                    await client.ModerationLogger.publish(guild, event)
                }
            }

            return bannedUsers;

        }
        
        /**
         * Create the action row for the user list.
         * @param {Boolean} backDisabled True if the back button should be disabled.
         * @param {Boolean} nextDisabled True if the next button should be disabled.
         */
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


        /**
         * Create and watch the embeds for the user list.
         * @param { Discord.SelectMenuInteraction } interaction The select menu interaction that called this function.
         * @param { String | null } reason The default reason to apply to this user list.
         */
        const createUserList = async (interaction, reason) => {
            const userListOperations = new Discord.Collection();

            for (let user of userListArray) {
                await createUserEmbed(user, reason)
            }

            const userListEmbed = userListGeneratedEmbeds.get(userListArray[0].id);
            
            interaction.editReply({ embeds: [userListEmbed], components: [createActionRow(true, false)] });
            
            let iterator = 0;
    
            const userActionButtonFilter = i => i.customId === 'back' || 'next' || 'pardon' || 'edit_reason' || 'continue' && i.user.id === interaction.member.user.id;
            const userActionButtonCollector = channel.createMessageComponentCollector({filter: userActionButtonFilter, componentType: 'BUTTON'});
            
                userActionButtonCollector.on('collect', async (interaction) => {
                    if (!interaction.isButton()) return;
                    else await interaction.deferUpdate();

                    switch (interaction.customId) {
                        case 'back':
                            if (iterator > 1) {
                                const embed = userListGeneratedEmbeds.get(userListArray[--iterator].id);
                                interaction.editReply({ embeds: [embed], components: [createActionRow(false, false)] });
                            } else {
                                const embed = userListGeneratedEmbeds.get(userListArray[--iterator].id);
                                interaction.editReply({ embeds: [embed], components: [createActionRow(true, false)] });
                            } 
                        break;

                        case 'next':
                            if (iterator < (userListArray.length - 1) - 1) {
                                const embed = userListGeneratedEmbeds.get(userListArray[++iterator].id);
                                interaction.editReply({ embeds: [embed], components: [createActionRow(false, false)] });
                            } else {
                                const embed = userListGeneratedEmbeds.get(userListArray[++iterator].id);
                                interaction.editReply({ embeds: [embed], components: [createActionRow(false, true)] });
                            } 
                        break;

                        case 'pardon':
                            if (userListOperations.get(userListArray[iterator].id) === 'pardon') {
                                await createUserEmbed(userListArray[iterator], reason)
                                .then(() => {
                                    const embed = userListGeneratedEmbeds.get(userListArray[iterator].id);
                                    interaction.editReply({ embeds: [embed] });
                                    userListOperations.set(userListArray[iterator].id, reason);
                                })
                            } else {
                                await createUserEmbed(userListArray[iterator], 'pardon')
                                .then(() => {
                                    const embed = userListGeneratedEmbeds.get(userListArray[iterator].id);
                                    interaction.editReply({ embeds: [embed] });
                                    userListOperations.set(userListArray[iterator].id, 'pardon');
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
                                        const embed = userListGeneratedEmbeds.get(userListArray[iterator].id);
                                        interaction.editReply({ embeds: [embed] });
                                        userListOperations.set(userListArray[iterator].id, collected.first().content);
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
                            for (let user of userListArray) {
                                if (userListOperations.has(user.id)) {
                                    continue;
                                } else {
                                    userListOperations.set(user.id, reason);
                                }
                            }
                            interaction.editReply({ embeds: [createOperationSummary(userListOperations)], components: [confirmActionRow()] })
                            userActionButtonCollector.stop();
                            listenForConfirmation(userListOperations);
                        break;
                    }
                });

        }

        /**
         * Turn the operation collection into an summary embed
         * @param {Discord.Collection} operations The operation collection to transform 
         */
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