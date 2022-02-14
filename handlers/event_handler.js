const fs = require('fs');
const ascii = require('ascii-table')
let table = new ascii("Events");

table.setHeading('Event', 'Status', 'Once');

module.exports = async (client, Discord) => {
    const load_dir = (dirs) =>{
        const event_files = fs.readdirSync(`./events/${dirs}`).filter(file => file.endsWith('.js'));

        for(const file of event_files){
            const event = require(`../events/${dirs}/${file}`);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            table.addRow(file, '✓', event.once ? '✓' : '✕');
        }

        console.log(table.toString());
    }
    
    load_dir('client')

}