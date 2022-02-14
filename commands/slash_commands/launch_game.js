const Discord = require('discord.js');

module.exports = {
    name: 'launch_game',
    description: 'Launch the selected Discord Embedded Game using discord-together',
    options: [
        {
            name: 'game',
            type: 'STRING',
            description: 'The name of the game to launch',
            required: true,
            choices: [
                {
                    name: 'betrayal',
                    value: 'betrayal',
                },
                {
                    name: 'chess',
                    value: 'chess',
                },
                {
                    name: 'checkers',
                    value: 'checkers',
                },
                {
                    name: 'doodle_crew',
                    value: 'doodlecrew',
                },
                {
                    name: 'fishing',
                    value: 'fishing',
                },
                {
                    name: 'letter_tiles',
                    value: 'lettertile',
                },
                {
                    name: 'ocho',
                    value: 'ocho',
                },
                {
                    name: 'poker',
                    value: 'poker',
                },
                {
                    name: 'sketch_heads',
                    value: 'sketchheads',
                },
                {
                    name: 'spell_cast',
                    value: 'spellcast',
                },
                {
                    name: 'word_snack',
                    value: 'wordsnack',
                }
            ]
        }
    ],
    async execute(interaction, client) {

        await interaction.deferReply();

        
        if (interaction.member.voice.channel) {

            const selectedGame = interaction.options.getString('game');
            const channel = await interaction.member.guild.channels.fetch(interaction.channelId);

            const invite = await client.discordTogether.createTogetherCode(interaction.member.voice.channelId, selectedGame);

            const inviteEmbed = new Discord.MessageEmbed()
                .setColor('#0099ff')
                .setDescription(`Click the link button below to join the game!`)

            const inviteButtonRow = new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                    .setLabel(`Join The Game!`)
                    .setStyle(`LINK`)
                    .setURL(`${invite.code}`)
                )

            await interaction.editReply({ embeds: [inviteEmbed], components: [inviteButtonRow] });

            // const filter = i => i.customId === 'cancel' && i.user.id === interaction.member.user.id;
            // const cancelCollector = channel.createMessageComponentCollector({filter: filter, componentType: 'BUTTON'});
            
            // cancelCollector.on('collect', async (interaction) => {
            //     if (!interaction.isButton()) return;
            //     else await interaction.deferUpdate();

            //     const cancelledEmbed = new Discord.MessageEmbed()
            //         .setColor('#0099ff')
            //         .setDescription(`This game has been closed.`)

            //     await interaction.editReply({ embeds: [cancelledEmbed], components: [] });
            //     cancelCollector.stop();

            // });

        } else {
            await interaction.editReply('You must be in a voice channel to use this command!');
        }



    }
}