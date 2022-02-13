const fs = require('fs');

module.exports = async (client, Discord) => {
    const slash_cmd_files = fs.readdirSync('./commands/slash_commands').filter(file => file.endsWith('.js'));

    for(const file of slash_cmd_files){
        const sCommand = require(`../commands/slash_commands/${file}`);
        if(sCommand.name && sCommand.enabled != false){
            client.slashCommands.set(sCommand.name, sCommand);
        } else {
            continue;
        }
    }


}