const fs = require('fs');

module.exports = async (client, Discord) => {
    const load_dir = (dirs) =>{
        const event_files = fs.readdirSync(`./events/${dirs}`).filter(file => file.endsWith('.js'));

        for(const file of event_files){
            const event = require(`../events/${dirs}/${file}`);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
                console.log(`Loaded event: ${event.name}`);
            }
        }
        console.log(`↼ Begin Startup ⇀`)
    }
    
    load_dir('client')

}