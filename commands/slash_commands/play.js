const ytdl = require('ytdl-core');

const { CommandInteraction, Client } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior } = require('@discordjs/voice')


module.exports = {
    name: 'play',
    description: "Play music",
    /**
     * @param { CommandInteraction } interaction The command interaction object.
     * @param { Client } client The discord client that called this command.
     */
    async execute(interaction, client) {
        await interaction.deferReply({ ephemeral: true });

        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) return interaction.editReply({ content:'You need to be in a voice channel to play music!', ephemeral: true });

        if (client.activePlayer) {
            const connection = getVoiceConnection(voiceChannel.guild.id);
            connection.destroy();
            client.removeAllListeners('voiceStateUpdate');
            client.activePlayer = false;
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
            connection.subscribe(player);

            client.activePlayer = true;

            player.on('unsubscribe', () => {
                player.stop();
                console.log('Player stopped');
            })

            player.on(AudioPlayerStatus.Playing, () => {
                interaction.editReply({ content: `Playing some chill music in ${voiceChannel ? voiceChannel.name : 'Unknown'}!`, ephemeral: true });
            })

            player.on('idle', () => {
                try {
                    player.stop();
                    connection.destroy();
                    client.activePlayer = false;
                } catch (error) {}
            })

            client.on('voiceStateUpdate', (oldState, newState) => {
                if (!newState.channelId && newState.member.id === client.user.id) {
                    player.stop();
                    client.activePlayer = false;
                    return
                }
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