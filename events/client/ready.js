const fs = require('fs');

module.exports = async (client, Discord) => {
    
    const slashCommandFiles = fs.readdirSync('./commands/slash/').filter(file => file.endsWith('.js'));

    for(const file of slashCommandFiles){
        const slash_command = require(`../commands/${file}`);
        if(slash_command.name){
            try {
                if (!client.application?.owner) await client.application?.fetch();
                const data = {
                    name: slash_command.name,
                    description: slash_command.description,
                };
                const command = await client.guilds.cache.get('813358737682726934')?.commands.create(data);
                console.log(command);

            } catch (error) {
                console.log(error)
            }
        } else {
            continue;
        }
    }
    
    client.user.setPresence({
        status: 'online',
        activity: {
            name: 'your requests!',
            type: 'LISTENING'
        }
    });
    
    console.log('Startup Complete');
}