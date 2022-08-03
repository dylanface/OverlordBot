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

    async recoverable(error) {
        console.error(error);

        if (process.env.DEVELOPMENT_MODE) return;

        const adminDM = await this.client.users.createDM('265023187614433282');
        await adminDM.send(`An error occured: \`\`\`${error}\`\`\``);
    }

    async fatal(error) {

    }

}

module.exports = ErrorHandler;