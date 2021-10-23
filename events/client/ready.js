const Discord= require('discord.js');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {

        // const roleTesting = await client.guilds.cache.get('869137600282259466').roles
        
        // console.log("---------")
        
        // for (let role of roleTesting.cache.values()) {
        //     console.log(`${role.name} is ${role.rawPosition} - permissions`)
        //     console.log(role.permissions.bitfield)
        // }
        // console.log("---------")

        const clientGuilds = client.guilds.cache

        // Function to set Guild commands for all guilds the bot is in
        const setGuildCommands = async () => {
            const commandList = [];

            await clientGuilds.forEach(async guild => {
                startupLog('newLogSection', guild.id)
                const data = [];
                
                await client.slashCommands.forEach(async command => { 
                    const sCommand = command;
                    data.push({
                        name: sCommand.name,
                        description: sCommand.description,
                        options: sCommand.options,
                        defaultPermission: sCommand.defaultPermission,
                    });
                    
                })
                
                const cmd = await guild.commands.set(data);
                
                await cmd.forEach(async registeredCmd => {
                    if (!commandList.includes(registeredCmd.name, 0)) commandList.push(registeredCmd.name);
                    const registeredSCommand = await client.slashCommands.get(registeredCmd.name);
                    registeredSCommand.registryId = registeredCmd.id;
                    if (registeredSCommand.permissions) {
                        
                        registeredCmd.permissions.set(registeredSCommand.permissions)
                        .then(console.log)
                        .catch(console.error);
                    } else {
        
                        // registeredCmd.permissions.set([])
                    }
                })
                
            })

        }

        // Function to populate pinMeUsers with the users who are part of the PinMe role.
        const populatePinMeUsers = async () => {
            const pinMeGuilds = client.pinMeGuildsCache;

            for (let guild of clientGuilds.values()) {
                pinMeGuilds.set(guild.id, new Discord.Collection());
                const pinGuild = await pinMeGuilds.get(guild.id)
                const pinMeRole = await guild.roles.cache.find(role => role.name === 'Pin Me');
                
                if (pinMeRole) {
                    client.pinBoardManager.registerGuildBoard(guild).catch(console.error);
                    const pinMeMembers = await pinMeRole.members;
                    await pinMeMembers.forEach(member => {
                        pinGuild.set(member.id, new Discord.Collection([['PinMe', true], ['availableNominations', 2 ]]));
                    })
                    startupLog('newLogEntry', guild.id, `${guild.name} has been added to the PinMe guilds cache with ${pinMeMembers.size} pinnable users.`)
                    
                    await guild.members.fetch()
                    .then(async members => {
                        members.forEach(member => {
                            if (!member.roles.cache.has(pinMeRole.id)) {
                                pinGuild.set(member.id, new Discord.Collection([[ 'availableNominations', 1 ]]));
                            }
                        })
                        startupLog('newLogEntry', guild.id, `${guild.name} has been fully loaded to the PinMe guilds cache with ${members.size} non pinnable users.`)
                    })

                } else {

                    pinMeGuilds.delete(guild.id);
                    startupLog('newLogEntry', guild.id, `PinMe role not found in ${guild.name} it will not be touched`)
                }
            }
        }

        // Function to log all of the startup actions to the console
        const startupLogs = new Discord.Collection();
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
        await populatePinMeUsers();
        startupLog('final');
        
        
        client.user.setPresence({
            status: 'online',
            activity: {
                name: 'your requests!',
                type: 'LISTENING'
            }
        });
    },
}