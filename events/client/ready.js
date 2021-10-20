const Discord= require('discord.js');
const Users = require('../../database/dbObjects.js')

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {

        if (!client.application?.owner) await client.application?.fetch();

        const clientGuilds = client.guilds.cache

        // Function to set Guild commands for all guilds the bot is in
        const setGuildCommands = async () => {
            const commandList = [];

            clientGuilds.forEach(async guild => {
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
    
                console.log(`The following commands have been registered for ${guild.name}:\n ${commandList}`);
            })


        }

        // Function to populate pinMeUsers with the users who are part of the PinMe role.
        const populatePinMeUsers = async () => {
            const pinMeGuilds = client.pinMeGuildsCache;

            for (let guild of clientGuilds.values()) {
                pinMeGuilds.set(guild.id, new Discord.Collection());
                client.pinBoardManager.registerGuildBoard(guild).catch(console.error);
                const pinGuild = await pinMeGuilds.get(guild.id)
                const pinMeRole = await guild.roles.cache.find(role => role.name === 'Pin Me');

                if (pinMeRole) {
                    const pinMeMembers = await pinMeRole.members;
                    await pinMeMembers.forEach(member => {
                        pinGuild.set(member.id, new Discord.Collection([['PinMe', true], ['availableNominations', 2 ]]));
                    })
                    console.log(`${guild.name} has been added to the PinMe guilds cache with ${pinMeMembers.size} pinnable users.`);
                    
                    await guild.members.fetch()
                    .then(async members => {
                        members.forEach(member => {
                            if (!member.roles.cache.has(pinMeRole.id)) {
                                pinGuild.set(member.id, new Discord.Collection([[ 'availableNominations', 1 ]]));
                            }
                        })
                        console.log(`${guild.name} has been fully loaded to the PinMe guilds cache with ${members.size} non pinnable users.`);
                    })

                } else {

                    pinMeGuilds.delete(guild.id);
                    console.log(`PinMe role not found in ${guild.name} it will not be touched`);
                }
            }
        }

        setGuildCommands();
        populatePinMeUsers();
        

        const storedBalances = await Users.findAll();
        storedBalances.forEach(b => client.currency.set(b.user_id, b));
        
        client.user.setPresence({
            status: 'online',
            activity: {
                name: 'your requests!',
                type: 'LISTENING'
            }
        });
    },
}