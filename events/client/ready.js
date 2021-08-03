const Users = require('../../database/dbObjects.js')

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {

        if (!client.application?.owner) await client.application?.fetch();

        const clientGuilds = client.guilds.cache

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
                const registeredSCommand = await client.slashCommands.get(registeredCmd.name);
                registeredSCommand.registryID = registeredCmd.id;
                if (registeredSCommand.permissions) {
                    
                    registeredCmd.permissions.set(registeredSCommand.permissions)
                    .then(console.log)
                    .catch(console.error);
                } else {
    
                    // registeredCmd.permissions.set([])
                }
            })

        });

        const storedBalances = await Users.findAll();
        storedBalances.forEach(b => client.currency.set(b.user_id, b));
        
        client.user.setPresence({
            status: 'online',
            activity: {
                name: 'your requests!',
                type: 'LISTENING'
            }
        });
        
        console.log('Startup Complete');
    },
}