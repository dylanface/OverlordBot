const client = require('../main.js');
const { v4: uuidv4 } = require('uuid');
const Discord = require('discord.js');
const fs = require('fs');

/**
* Brief description of the class here
* @extends ParentClassNameHereIfAny
*/

class OperationPanelManager {
    constructor(guild) {
        this.id = Discord.SnowflakeUtil.generate();
        this.cache = new Discord.Collection();
        this.guild = guild;
    }

    
}


// SECTION Guild Panel
class GuildPanel extends OperationPanelManager {
    constructor(guild) {
        super(guild);
    }


} // !SECTION Guild Panel

// SECTION User Panel
class UserPanel extends GuildPanel {
    constructor(guild) {
        super(guild);
    }

    
} // !SECTION User Panel



/* SECTION Games Panel
TODO List Games
TODO End Games
!SECTION Games Panel
*/
