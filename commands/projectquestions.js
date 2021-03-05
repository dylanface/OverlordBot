module.exports = {
    name: 'projectcreate',
    description: "Set up a project with simple questions",
    async execute(client, message, args, Discord) {
        const questions = [
            'What is the project title?', //0
            'Describe the project.', //1
            'What are the requirements to submit this project for completion?', //2
            'What plugins are needed for the project with a return after each plugin title?', //3
            'Please link the required plugins with a return after each link.' //4
            
        ]
        
        let counter = 0

        const filter = m => m.author.id === message.author.id

        const collector = new Discord.MessageCollector(message.channel, filter, {max: questions.length});
        let guild = message.guild;

        message.channel.send(questions[counter++]);

        collector.on('collect', m => {
            if (counter < questions.length) {
                m.channel.send(questions[counter++])
            }
        });

        collector.on('end', collected => {
            console.log(`Collected ${collected.size} messages`)
            const msgs = collected.array();
            try {
                const embedTitle = msgs[0].toString();
                const channelName = embedTitle.toString().toLowerCase();
                const embedDescription = msgs[1];
                const embedCriteria = msgs[2];
                const embedDependencies = msgs[3];
                const embedDependancyLinks = msgs[4];

                guild.channels.create((channelName), { 
                    type: 'text',
                    reason: 'I do what I am told' })
                    .then(async (channel) => {
                        let infoEmbed = new Discord.MessageEmbed()
                            .setColor('#f9b7f2')
                            .setAuthor('Staff Project', 'https://sm.mashable.com/mashable_in/seo/6/6589/6589_74qk.jpg')
                            .setTitle(embedTitle + ' Project')
                            .setDescription(embedDescription)
                            .addFields(
                                { name: '\n\nCompletion Criteria:', value: embedCriteria },
                                { name: 'Dependancies:', value: embedDependencies },
                                { name: 'Dependancy Links:', value: embedDependancyLinks })
                            
                        const projectManagerEmoji = '👩‍💼';
                        const projectHelperEmoji = '👩‍🔧';
                        const submitProjectEmoji = '🎀';
                        const closeProjectEmoji = '⛔';
                        const acceptProjectEmoji = '👍';
                        const denyProjectEmoji = '👎';
                        const confirmEmoji = '✅';
                        const cancelEmoji = '❌';

                        let projectManager = []
                        let projectHelper = []

                        let roleEmbed = new Discord.MessageEmbed()
                            .setColor('#f9b7f2')
                            .setTitle('Choose your preferred project role')
                            .setDescription('Choosing a project role will allow you to complete projects!\n\n'
                                + `${projectManagerEmoji} to become Project Manager\n`
                                + `${projectHelperEmoji} to become a Project Helper`);

                        let sentEmbed; 
                        let infoMessageEmbed = await channel.send(infoEmbed)
                            sentEmbed = infoMessageEmbed;
                        infoMessageEmbed.react(submitProjectEmoji);
                        infoMessageEmbed.react(closeProjectEmoji);

                        channel.send(`<@&811468071138492417> There is a new project available check out the info above, and claim your role below if interested!`);

                        let messageEmbed = await channel.send(roleEmbed);
                        messageEmbed.react(projectManagerEmoji);
                        messageEmbed.react(projectHelperEmoji);                    

                        client.on('messageReactionAdd', async (reaction, user) => {
                            if (reaction.message.partial) await reaction.message.fetch();
                            if (reaction.partial) await reaction.fetch();
                            if (user.bot) return;
                            if (!reaction.message.guild) return;

                            if (reaction.message.channel.id == channel) {
                                if (reaction.emoji.name === projectManagerEmoji || reaction.emoji.name === projectHelperEmoji){
                                    if (reaction.emoji.name === projectManagerEmoji) {
                                        projectManager.push(user.tag);
                                    }
                                    if (reaction.emoji.name === projectHelperEmoji) {
                                        projectHelper.push(user.tag);
                                    }

                                    let addroleEmbed = new Discord.MessageEmbed()
                                        .setColor('#f9b7f2')
                                        .setAuthor('Staff Project', 'https://sm.mashable.com/mashable_in/seo/6/6589/6589_74qk.jpg')
                                        .setTitle(embedTitle + ' Project')
                                        .setDescription(embedDescription)
                                        .addFields(
                                            { name: 'Completion Criteria:', value: embedCriteria },
                                            { name: 'Dependancies:', value: embedDependencies },
                                            { name: 'Dependancy Links:', value: embedDependancyLinks },
                                            { name: 'Project Members:', value: 'Managers -\n' + projectManager.toString() + '\n\nHelpers -\n' + projectHelper.toString() },
                                        )
                                    sentEmbed.edit(addroleEmbed);
                                }

                                if (reaction.emoji.name === submitProjectEmoji || reaction.emoji.name === denyProjectEmoji) {
                                    if (reaction.emoji.name === submitProjectEmoji) {
                                        channel.send('Please attach the project submission files in the form of a .zip archive.');
                                        client.on('message', async (message) => {
                                            if(message.attachments.size >= 1){
                                                channel.send('Thank you, your project will be reviewed shortly by a Developer!');
                                                let submissionEmbed = new Discord.MessageEmbed()
                                                    .setColor('#f9b7f2')
                                                    .setTitle('Project ready for review!')
                                                    .setDescription('Choose an option below to continue the project submission process!\n\n'
                                                        + `${acceptProjectEmoji} to accept the project in its current state\n\n`
                                                        + `${denyProjectEmoji} to reject the project in its current state`);

                                                let reviewMessage = await channel.send(submissionEmbed);
                                                reviewMessage.react(acceptProjectEmoji);
                                                reviewMessage.react(denyProjectEmoji);

                                                channel.send('<@&812437222527074346>');

                                                client.on('messageReactionAdd', async (reaction, user) => {
                                                    if (reaction.message.partial) await reaction.message.fetch();
                                                    if (reaction.partial) await reaction.fetch();
                                                    if (user.bot) return;
                                                    if (!reaction.message.guild) return;

                                                    if (reaction.message.channel.id == channel) {
                                                        if (reaction.emoji.name === acceptProjectEmoji || reaction.emoji.name === denyProjectEmoji) {
                                                            if (reaction.emoji.name === acceptProjectEmoji) {
                                                                channel.send('Your submission has been accepted, thank you for your help!');
                                                            }
                                                            if (reaction.emoji.name === denyProjectEmoji) {
                                                                channel.send('Your submission has been denied, the Developer in charge of reviewing will get in touch with info on how to resubmit the project')
                                                            }

                                                        }
                                                    }
                                                })
                                            }
                                        });
                                    }
                                }
                                if (reaction.emoji.name === closeProjectEmoji) {
                                    infoMessageEmbed.react(confirmEmoji);

                                    client.on('messageReactionAdd', async (reaction, user) => {
                                        if (reaction.message.partial) await reaction.message.fetch();
                                        if (reaction.partial) await reaction.fetch();
                                        if (user.bot) return;
                                        if (!reaction.message.guild) return;

                                        if (reaction.message.channel.id == channel) {
                                            if (reaction.emoji.name === confirmEmoji) {
                                                channel.send('This channel will be closed in 5 seconds.');
                                                setTimeout(function() { channel.delete(); }, 5000);
                                            }
                                        } else {
                                            return;
                                        }
                                    })

                                } 

                            } else {
                                return;
                            }

                        client.on('messageReactionRemove', async (reaction, user) => {
                            if (reaction.message.partial) await reaction.message.fetch();
                            if (reaction.partial) await reaction.fetch();
                            if (user.bot) return;
                            if (!reaction.message.guild) return;

                            if (reaction.message.channel.id == channel) {
                                if (reaction.emoji.name === projectManagerEmoji || reaction.emoji.name === projectHelperEmoji) {
                                    if (reaction.emoji.name === projectManagerEmoji) {
                                        const search_term = user.tag;

                                        for (var i = projectManager.length - 1; i >= 0; i--) {
                                            if (projectManager[i] === search_term) {
                                                projectManager.splice(i, 1);
                                            }
                                        }
                                    }
                                
                                    if (reaction.emoji.name === projectHelperEmoji) {
                                        const search_term = user.tag;

                                        for (var i = projectHelper.length - 1; i >= 0; i--) {
                                            if (projectHelper[i] === search_term) {
                                                projectHelper.splice(i, 1);
                                            }
                                        }
                                    }   
                                    let addroleEmbed = new Discord.MessageEmbed()
                                        .setColor('#f9b7f2')
                                        .setAuthor('Staff Project', 'https://sm.mashable.com/mashable_in/seo/6/6589/6589_74qk.jpg')
                                        .setTitle(embedTitle + ' Project')
                                        .setDescription(embedDescription)
                                        .addFields(
                                            { name: 'Completion Criteria:', value: embedCriteria },
                                            { name: 'Dependancies:', value: embedDependencies },
                                            { name: 'Dependancy Links:', value: embedDependancyLinks },
                                            { name: 'Project Members:', value: 'Managers -\n' + projectManager.toString() + '\n\nHelpers -\n' + projectHelper.toString() },
                                            )
                                    sentEmbed.edit(addroleEmbed);
                                }
                            } else {
                                return;
                            }
                        
                        })
                        

                    })
                    
                }).catch(console.error);
            }
            catch (ex) {
                message.channel.send("There has been an exception, check logs for more info")
            }
            let counter = 0
                        
        })                   
            
    }
}
            