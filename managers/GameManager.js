const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

module.exports = async (client, Discord) => {
    
    /*
    *    Represents an instance of any game within Overlord
    *    @param {object} initiatingUser The User who started the game instance
    *    @param {UUID} gameUUID A unique class generated UUID representing this game instance
    *    @param {integer} gameNumber The order number of the gameMode game instance list
    *    @param {string} gameType The game type this instance represents
    *    @param {collection} challengers The challenged User(s) if any
    */
    class GameInstance {
        constructor(initiatingUser, gameNumber, gameType, challengers, modifiers) {

            this.initiatingUser = initiatingUser;
            this.gameNumber = gameNumber;
            this.gameType = gameType;
            this.dateOfCreation = new Date()
            this.challengers = challengers;
            this.modifiers = modifiers;
            this.players = new Discord.Collection()
            this.mods = new Discord.Collection()
            this.rewards = new Discord.Collection()
            
            this.gameUUID = new uuidv4();
        }

        addPlayer(id) {
            const user = await this.players.get(id);
		    if (user) return user;
		    else {
                let user = await this.players.set(id, new Discord.Collection())
                return user;
            }
        }

        addPlayerScore(id, amount) {
            let user = await this.players.get(id);
            if (user) user.points += amount
            else {
                user = this.addPlayer(id)
                user.points += amount
            }
        }

        addMod(id) {
            const mod = await this.mods.get(id);
		    if (mod) return mod;
		    else {
                let mod = await this.mods.set(id, new Discord.Collection())
                return mod;
            }
        }

        clearModifiers() {
            this.modifiers.clear()
        }

        setGameType(gameType) {
            this.gameType = gameType
        }

        

    }

    
}