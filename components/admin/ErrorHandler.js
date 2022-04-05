// const RestartHandler = require('./RestartHandler');
const Discord = require('discord.js');


/**
    * Background process to handle errors and call upon the ResetHandler or Bot Reset 
*/
class ErrorHandler {

    constructor(client) {
        this.client = client;
        // this.RestartHandler = new RestartHandler(this.client);
    }

    async fatal(error) {
        console.error(error);
        const adminDM = await this.client.users.createDM('265023187614433282');
        await adminDM.send(`An error occured: \`\`\`${error}\`\`\``);
        // this.client.destroy();
        // console.log('Client has been destroyed');
    }

    async recoverable(error) {

    }

}

module.exports = ErrorHandler;