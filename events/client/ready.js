module.exports = async (Discord, client, message) => {

    const guildID = '813358737682726934';
    const fetchGuild = client.guilds.cache.get(guildID);
    
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
    
    const cmd = await fetchGuild?.commands.set(data);

    cmd.forEach(async registeredCmd => {
        const registeredSCommand = await client.slashCommands.get(registeredCmd.name);
        registeredSCommand.registryID = registeredCmd.id;
        console.log(registeredSCommand);
        if (registeredSCommand.permissions) {

            registeredCmd.setPermissions(registeredSCommand.permissions)
            .then(console.log)
            .catch(console.error);
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
}