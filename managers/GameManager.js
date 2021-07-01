const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Discord = require('discord.js');

const gameRegistry = new Discord.Collection();

    /**
    *    Represents an instance of any game within Overlord
    *    @param {string} name The name of this game instance
    *    @param {object} initiatingUser The User who started the game instance
    *    @param {integer} gameNumber The order number of the gameMode game instance list
    *    @param {string} gameType The game type this instance represents
    *    @param {collection} challengers The challenged User(s) if any
    *    @param {collection} modifiers The game modifier(s) if any
    *    @param {object} guild The guild in which this game was created
    */
    class GameInstance {
        constructor(
            name,
            initiatingUser,
            gameNumber,
            gameType,
            challengers,
            modifiers,
            guild,
        ) {
            this.name = name;
            this.initiatingUser = initiatingUser;
            this.gameNumber = gameNumber;
            this.gameType = gameType;
            this.dateOfCreation = new Date();
            this.challengers = challengers;
            this.modifiers = modifiers;
            this.players = new Discord.Collection();
            this.mods = new Discord.Collection();
            this.rewards = new Discord.Collection();
            this.gameState = 'Startup';
            this.gameID = Discord.SnowflakeUtil.generate();
            this.guild = guild;

            this.gameUUID = uuidv4();

            gameRegistry.set(this.gameID, GameInstance);
        }

        async addPlayer(id) {
            const user = await this.players.get(id);
            if (user) return console.log(`This user already exists`);
            else {
                let user = await this.players.set(id, new Discord.Collection());
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
            const mod = await this.mods.get(id);
            if (mod) return mod;
            else {
                let mod = await this.mods.set(id, new Discord.Collection());
                return mod;
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
        
        delPlayerChannel(id) {
            const player = this.getPlayer(id)
            const channel = player.get('playChannel')
            channel.delete()
            player.delete('playChannel')
            return GameInstance;
        }


        //TODO: getCoinsInPot

        //TODO: Assigning rewards
        //getWinners(#OfWinners?)

        //TODO: delete/remove game from registry

    }
    
module.exports = GameInstance, gameRegistry; 
