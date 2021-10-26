const Discord = require('discord.js');
const ytdl = require('ytdl-core');
const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, NoSubscriberBehavior, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice')


module.exports = {
    name: 'play',
    description: "Play music",
    options: [
        {
            name: 'end',
            description: 'True or False',
            type: 'BOOLEAN',
            required: true
        }
    ],
    async execute(interaction, client) {
        await interaction.deferReply({ content: '...Loading Music', ephemeral: true });

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return interaction.editReply({ content:'You need to be in a voice channel to play music!', ephemeral: true });
        
        const endInput = interaction.options.getBoolean('end')
        if (endInput) {
            const connection = getVoiceConnection(voiceChannel.guild.id);
            connection.destroy();
            return interaction.editReply({ content: 'Music stopped', ephemeral: true });
        } else {

            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer({
                behaviors: {
                    noSubscriber: NoSubscriberBehavior.Pause,
                },
            });
            const liveStream = ytdl('https://www.youtube.com/watch?v=5qap5aO4i9A', {
                filter: 'audio',
                quality: 'highestaudio',
                liveBuffer: 1000,
            })
            const resource = createAudioResource(liveStream, { inlineVolume: true });
            resource.volume.setVolume(0.05);

            player.play(resource);

            connection.subscribe(player)

            player.on('unsubscribe', () => {
                player.stop();
                console.log('Player stopped');
            })

            player.on(AudioPlayerStatus.Playing, () => {
                interaction.editReply({ content: `Playing some chill music in ${interaction.member.voice.channel.name}!`, ephemeral: true });
            })

            player.on('idle', () => {
                try {
                    player.stop();
                    connection.destroy();
                } catch (error) {}
            })

            client.on('voiceStateUpdate', (oldState, newState) => {
                if (newState.channelId && newState.channel.type === 'GUILD_STAGE_VOICE' && newState.guild.me.voice.suppress) {
                    try {
                        newState.guild.me.voice.setSuppressed(false);
                    } catch (error) {
                        console.log(error)
                    }
                } 
            })
        }

		
    }
}