const Users = require('../../database/dbObjects.js')

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {

        const storedBalances = await Users.findAll();
        storedBalances.forEach(b => client.currency.set(b.user_id, b));

        const testDDServer = '869137600282259466';
        const karaServer = '140247578242580481';

        const guildID = testDDServer;
        const fetchGuild = await client.guilds.cache.get(guildID);
        
        if (!client.application?.owner) await client.application?.fetch();
        
        const data = [];
        
        client.slashCommands.forEach(async command => { 
            const sCommand = command;
            data.push({
                name: sCommand.name,
                description: sCommand.description,
                options: sCommand.options,
                defaultPermission: sCommand.defaultPermission,
            });
            
        })
        
        const cmd = await fetchGuild.commands.set(data);
        
        cmd.forEach(async registeredCmd => {
            const registeredSCommand = await client.slashCommands.get(registeredCmd.name);
            registeredSCommand.registryID = registeredCmd.id;
            if (registeredSCommand.permissions) {
                
                registeredCmd.permissions.set(registeredSCommand.permissions)
                .then(console.log)
                .catch(console.error);
            } else {

            //     registeredCmd.permissions.set([])
            }
        })
        
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