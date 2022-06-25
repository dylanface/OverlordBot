const Discord = require('discord.js');
const { registerGuildCommands, fetchGuildInfo } = require('../../util/guild_init');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {

        const clientGuilds = client.guilds.cache;
        const startupLogs = new Discord.Collection();

        /**
        Function to set Guild commands for all guilds the bot is in
        */
        const setGuildCommands = async () => {

            await clientGuilds.forEach(async guild => {
                startupLog('newLogSection', guild.id)

                await registerGuildCommands(guild.id, client);
                
            })

        }

        /**
         * Function to fetch information about all guilds the bot is in.
         */
        const fetchGuildForCache = async () => {

            for (const guild of clientGuilds.values()) {
                const channelCount = await fetchGuildInfo(guild.id, client);

                startupLog('newLogEntry', guild.id, `${guild.name} has ${channelCount} channels that have been cached`)
            }

        }

        /**
        Function to log all of the startup actions to the console
        */
        const startupLog = async (action, guildId, log) => {
            if (action === 'newLogSection' && guildId && !startupLogs.has(guildId)) {
                startupLogs.set(guildId, []);
            }
            else if (action === 'newLogEntry' && guildId && log) {
                const fetchSection = await startupLogs.get(guildId)
                fetchSection.push(log);
            }
            else if (action === 'final') {
                const date = new Date();
                console.log(`⟫ Startup log from ${date.toLocaleString()} ⟪`)
                for (let log of startupLogs.values()) {
                    log.forEach(log => console.log(log))
                    console.log(`-----`)
                }
            }
        }

        await setGuildCommands()
        await fetchGuildForCache()
        startupLog('final');
        
        client.user.setPresence({
            status: 'online',
            activity: {
                name: 'your requests!',
                type: 'LISTENING'
            }
        });
        
    }
    
}