const Discord = require('discord.js');

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
            // const commandList = [];

            await clientGuilds.forEach(async guild => {
                startupLog('newLogSection', guild.id)
                const data = [];
                
                await client.slashCommands.forEach(async command => { 
                    const sCommand = command;
                    data.push({
                        name: sCommand.name,
                        description: sCommand.description,
                        options: sCommand.options
                    });
                    
                })
                
                const cmd = await guild.commands.set(data);
                
            })

        }

        /**
         * Function to fetch information about all guilds the bot is in.
         */
        const fetchGuildInfo = async () => {

            for (const guild of clientGuilds.values()) {
                if (!guild.available) return;
                const availableChannels = await guild.channels.fetch(null, {cache:true});
                client.totalMembers += guild.memberCount;

                startupLog('newLogEntry', guild.id, `${guild.name} has ${availableChannels.size} channels that have been cached`)
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
        await fetchGuildInfo()
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