const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Discord = require('discord.js');

    /**
    *    Represents an instance of any game within Overlord
    *    @param {object} initiatingUser The User who started the game instance
    *    @param {integer} gameNumber The order number of the gameMode game instance list
    *    @param {string} gameType The game type this instance represents
    *    @param {collection} challengers The challenged User(s) if any

    *    @param {collection} challengers The challenged User(s) if any
    */
    class GameInstance {
      constructor(
        initiatingUser,
        gameNumber,
        gameType,
        challengers,
        modifiers
      ) {
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

        this.gameUUID = new uuidv4();
      }

      addPlayer(id) {
        const user = await this.players.get(id);
        if (user) return user;
        else {
          let user = await this.players.set(id, new Discord.Collection());
          return GameInstance;
        }
      }
      
      removePlayer(id) {
        const user = await this.players.get(id);
        if (user) this.players.delete(id);
        return GameInstance;
      }

      getPlayer(id) {
        return this.players.get(id);
      }

      getPlayers() {
        return this.players;
      }

      addPlayerScore(id, amount) {
        let playerScore = await this.players.get(id);
        if (playerScore) playerScore += amount;
        else {
          playerScore = this.addPlayer(id);
          playerScore += amount;
        }
        return GameInstance;
      }

      //TODO: getLeaderboard(amount)? rank players scores in the game instance
      //if amount between numbers: display number of users on leaderboard

      addMod(id) {
        const mod = await this.mods.get(id);
        if (mod) return mod;
        else {
          let mod = await this.mods.set(id, new Discord.Collection());
          return mod;
        }
      }

      clearModifiers() {
        this.modifiers.clear();
        return GameInstance
      }

      setGameType(gameType) {
        this.gameType = gameType;
        return GameInstance;
      }

      addCoinsToPot(id, amount) {
        let userRewards = await this.rewards.get(id);
        if (userRewards) {
          userRewards += amount;
        } else {
            this.rewards.set(id, amount);
        }
        client.currency.add(id, -amount)
        return GameInstance
      }
            
      changeGameState(gameState) {
          this.gameState = gameState;
          return GameInstance;
      } 
      
      
      //TODO: getCoinsInPot

      //TODO: Assigning rewards
      //getWinners(#OfWinners?)


}

    
module.exports = GameInstance;