const { v4: uuidv4 } = require('uuid');
const Discord = require('discord.js');

const gameRegistry = new Discord.Collection();

    /**
    *    Represents an instance of any game within Overlord
    *    @param {string} name The name of this game instance
    *    @param {object} master The User who started the game instance
    *    @param {integer} gameNumber The order number of the gameMode game instance list
    *    @param {string} gameType The game type this instance represents
    *    @param {collection} challenger The challenged User(s) if any
    *    @param {collection} modifiers The game modifier(s) if any
    *    @param {object} guild The guild in which this game was created
    */
    class GameInstance {
        constructor(
            name,
            master, //made this master ✔ 
            gameNumber,
            gameType,
            challenger, //made this challenger ✔?
            modifiers,
            guild, //what were you saying about messing around with stuff ? Anything cool ?
        ) {
            this.name = name;
            this.master = master; //made this.master ✔
            this.gameNumber = gameNumber;
            this.gameType = gameType;
            this.dateOfCreation = new Date();
            this.challenger = challenger; //made this.challenger ✔
            this.modifiers = modifiers;
            this.players = new Discord.Collection();
            this.gameMasters = new Discord.Collection();
            this.rewards = new Discord.Collection();
            this.gameState = 'Startup';
            this.gameID = Discord.SnowflakeUtil.generate();
            this.guild = guild;

            this.gameUUID = uuidv4();

            gameRegistry.set(this.gameID, GameInstance);
            this.gameMasters.set(this.master.id, new Discord.Collection());
            
        }

        async addPlayer(id) {
            const user = await this.players.get(id);
            if (user) return console.log(`This user already exists`);
            else {
                let user = this.players.set(id, new Discord.Collection());
                return user;
            }
        }

        async removePlayer(id) {
            const user = await this.players.get(id);
            if (user) this.players.delete(id);
            return this.players;
        }

        getPlayer(id) {
            return this.players.get(id);
        }

        getPlayers() {
            return this.players;
        }

        async addPlayerScore(id, amount) {
            let playerScore = await this.players.get(id);
            if (playerScore) playerScore += amount;
            else {
                playerScore = this.addPlayer(id);
                playerScore += amount;
            }
            return playerScore;
        }

        //TODO: getLeaderboard(amount)? rank players scores in the game instance
        //if amount between numbers: display number of users on leaderboard

        async addMod(id) {
            const gameMasters = await this.gameMasters.get(id);
            if (gameMasters) return gameMasters;
            else {
                let gameMasters = await this.gameMasters.set(id, new Discord.Collection());
                return gameMasters;
            }
        }

        clearModifiers() {
            this.modifiers.clear();
            return this.modifiers;
        }

        setGameType(gameType) {
            this.gameType = gameType;
            return this.gameType;
        }

        async addCoinsToPot(id, amount) {
            let userRewards = await this.rewards.get(id);
            if (userRewards) {
                userRewards += amount;
            } else {
                this.rewards.set(id, amount);
            }
            client.currency.add(id, -amount)
        }

        changeGameState(gameState) {
            this.gameState = gameState;
            return this.gameState;
        }

        addPlayerChannel(id, channel) {
            const player = this.getPlayer(id)
            player.set('playChannel', channel)
            return GameInstance;
        }
        
        /* delPlayerChannel(id) { //wasn't working correctly when I was trying it.
            const player = this.getPlayer(id)
            const channel = player.get('playChannel')
            channel.delete()
            player.delete('playChannel')
            return GameInstance;
        } */
        //Had to expand it out a bit so it stopped erroring ✔
        delPlayerChannel(id) {
            const player = this.players.get(id)
            let channel = null
            if (player.get('playChannel')) {
                channel = player.get('playChannel')
            }
            else {
                console.log('Player didn\'t have playChannel to delete')
                return GameInstance;
            }
            channel.delete()
            player.delete('playChannel')
            return GameInstance;
        }
       

        //we didn't have a "get player channel" ✔
        getPlayerChannel(id) {
            const player = this.players.get(id)
            let channel = player.get('playChannel')
            return channel;
        }

        //TODO: getCoinsInPot

        //TODO: Assigning rewards
        //getWinners(#OfWinners?)

        //TODO: delete/remove game from registry

    }
    
module.exports = GameInstance, gameRegistry; 
