const fs = require('fs');
const ascii = require('ascii-table')
let table = new ascii("Slash Commands");

table.setHeading('Command', 'Status');

module.exports = async (client) => {
    const slash_cmd_files = fs.readdirSync('./commands/slash_commands').filter(file => file.endsWith('.js'));
    
    for(const file of slash_cmd_files){
        const sCommand = require(`../commands/slash_commands/${file}`);
        if(sCommand.name && sCommand.enabled != false){
            client.slashCommands.set(sCommand.name, sCommand);
            table.addRow(file, '✓');
        } else if (sCommand.name && sCommand.enabled === false) {
            table.addRow(file, '✕');
            continue;
        } else continue;
    }
    

    console.log(table.toString());
}