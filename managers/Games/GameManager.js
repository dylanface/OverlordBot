const { v4: uuidv4 } = require('uuid');
const Discord = require('discord.js');

const gameRegistry = new Discord.Collection();

/**
* Represents an instance of any game within Overlord
* @param {string} name The name of this game instance
* @param {object} master The User who started the game instance
* @param {integer} gameNumber The order number of the gameMode game instance list
* @param {string} gameType The game type this instance represents
* @param {collection} challenger The challenged User(s) if any
* @param {collection} modifiers The game modifier(s) if any
* @param {object} guild The guild in which this game was created
*/
class GameInstance {
    constructor(
        name,
        master,
        gameNumber,
        gameType,
        challenger,
        modifiers,
        guild,
    ) {
        this.name = name;
        this.master = master;
        this.gameNumber = gameNumber;
        this.gameType = gameType;
        this.dateOfCreation = new Date();
        this.challenger = challenger;
        this.modifiers = modifiers;
        this.players = new Discord.Collection();
        this.masters = new Discord.Collection();
        this.rewards = new Discord.Collection();
        this.gameState = 'Startup';
        this.gameId = Discord.SnowflakeUtil.generate();
        this.guild = guild;
        this.statsCache = new Discord.Collection();

        this.gameUUId = uuidv4();

        this.masters.set(this.master.id, new Discord.Collection());
        gameRegistry.set(this.gameId, this);
        
    }

    async updateRegistry() {
        gameRegistry.set(this.gameId, this);
        // console.log(`Game Instance ${this.gameId} updated in registry.`);
    }

    // SECTION Players 
    async addPlayer(id) {
        const user = await this.players.get(id);
        if (user) return console.log(`This user already exists`);
        else this.players.set(id, new Discord.Collection());
        return this.updateRegistry()
    }

    async removePlayer(id) {
        const user = await this.players.get(id);
        if (user) this.players.delete(id);
        return this.updateRegistry()
    }

    getPlayer(id) {
        if (this.players.has(id)) return this.players.get(id);
        else if (this.masters.has(id)) return this.masters.get(id);
    }

    getPlayers() {
        return this.players;
    }

    async addMaster(id) {
        const gameMasters = await this.masters.get(id);
        if (gameMasters) return this.updateRegistry()
        else {
            this.masters.set(id, new Discord.Collection());
            return this.updateRegistry()
        }
    }

    getMaster(id) {
        return this.masters.get(id);
    }
    // !SECTION Players

    // SECTION Game States
    changeGameState(gameState) {
        this.gameState = gameState;
        return this.updateRegistry()
    }

    endGame() {
        this.softEnd()
        this.delPlayerChannel(this.master.id)
    }

    softEnd() {
        this.gameState = 'Ended';
        if (gameRegistry.has(this.gameId)) {
            gameRegistry.delete(this.gameId);
            return console.log(`There are currently ${gameRegistry.size} games in the registry.`);
        } else {
            return;
        }
    }

    startGame() {
        if (this.gameState === 'Startup') {
            this.gameState = 'Active';
            console.log(`Game ${this.gameId} is now active!`);
            return this.updateRegistry()
        }
    }
    // !SECTION Game States

    // SECTION Channels
    addPlayerChannel(id, channel) {
        const player = this.getPlayer(id)
        player.set('playChannel', channel)
        return this.updateRegistry()
    }
    
    delPlayerChannel(id) {
        const player = this.players.get(id)
        let channel = null
        if (player.get('playChannel')) {
            channel = player.get('playChannel')
            setTimeout(() => channel.delete(), 10000)
            return this.updateRegistry()
        }
        else {
            console.log('Player didn\'t have playChannel to delete')
            return this.updateRegistry()
        }

    }
    
    getPlayerChannel(id) {
        const player = this.players.get(id)
        let channel = player.get('playChannel')
        return channel;
    }
    // !SECTION Channels

    // SECTION Coins/Rewards
    async addCoinsToPot(id, amount) {
        let userRewards = await this.rewards.get(id);
        if (userRewards) {
            userRewards += amount;
        } else {
            this.rewards.set(id, amount);
        }
        client.currency.add(id, -amount)
        return this.updateRegistry()
    }

    // TODO: getCoinsInPot

    // TODO: Assigning rewards
    // getWinners(#OfWinners?)

    // !SECTION Coins/Rewards

    // SECTION Scores/Stats
    async addPlayerScore(id, amount) {
        let playerScore = await this.players.get(id);
        if (playerScore) playerScore += amount;
        else {
            playerScore = this.addPlayer(id);
            playerScore += amount;
        }
        return this.updateRegistry()
    }

    // TODO: getLeaderboard(amount)? rank players scores in the game instance
    // if amount between numbers: display number of users on leaderboard

    // !SECTION Scores/Stats

    // SECTION Misc
    clearModifiers() {
        this.modifiers.clear();
        return this.updateRegistry()
    }

    setGameType(gameType) {
        this.gameType = gameType;
        return this.updateRegistry()
    }

    // !SECTION Misc


    /** 
    * SECTION Create Dungeon
    * Create a dungeon for the master of the game.
    * @param {object} game - The game instance to create a dungeon for.
    * @param {object} interaction - The command interaction that called createDungeon().
    * @param {object} client - Static passthrough of client object.
    */
    async createDungeon(game, interaction, client) { 
        if (!game || game === null) return;
        const guild = interaction.guild
        const everyone = guild.roles.cache.find(role => role.name == '@everyone')
        
        const gameType = game.gameType;
        
        
        if (gameType == 'bingo') { // SECTION Bingo Dungeon
            const masterSupports = guild.roles.cache.find(role => role.permissions.has('MANAGE_CHANNELS'));
            const modTools = await guild.channels.cache.find(cat => cat.name === '⚙  Mod Tools  ⚙')
            
            const dungeonChannel = await guild.channels.create(`${game.name} Moderation`, 
                {
                    topic: `${game.name} Moderation Tools`,
                    parent: modTools,
                    permissionOverwrites: [
                        {
                            id: everyone.id,
                            deny: ['CREATE_INSTANT_INVITE', 'VIEW_CHANNEL'],
                            type: "role",
                        },
                        {
                            id: masterSupports.id,
                            allow: ['VIEW_CHANNEL'],
                            type: "role",
                        },
                    ],
                })
            
            const dungeonEmbed = new Discord.MessageEmbed()
                .setTitle(`${game.gameType} #${game.gameNumber} - Mod Tools`)
                .setDescription('Stuff In Here')
                .addField(`Current Players:`, `${game.players.size}`, true)
                .addField(`Game Status:`, `${game.gameState}`, true)
            

            const refresh = new Discord.MessageButton()
                .setCustomId('refresh')
                .setLabel(`Refresh`)
                .setStyle('PRIMARY')
            const startGame = new Discord.MessageButton()
                .setCustomId('startGame')
                .setLabel(`Start Game`)
                .setStyle('SUCCESS')
            const endGame = new Discord.MessageButton()
                .setCustomId('endGame')
                .setLabel(`End Game`)
                .setStyle('DANGER')

            const modButtons = new Discord.MessageActionRow()
                .addComponents(
                    [refresh, startGame, endGame]
                );

            const dungeonPanel = await dungeonChannel.send({ embeds: [dungeonEmbed], components: [modButtons] })

            const filter = interaction => interaction.customId !== null;
            const collector = dungeonPanel.createMessageComponentCollector(filter);

            collector.on('collect', async i => {
                if (i.customId === 'refresh'){
                    //meh
                } else if (i.customId === 'startGame'){
                    game.startGame()
                } else if (i.customId === 'endGame'){
                    game.endGame();
                    collector.stop()
                }
                i.message.embeds[0].fields[0].value = `${game.players.size}`
                i.message.embeds[0].fields[1].value = `${game.gameState}`
                i.update({ embeds: i.message.embeds, components: [i.message.components[0]] });
            });

            collector.on('end', collected => {
                // TODO End game stuff...?
                dungeonChannel.delete()
            });
        // !SECTION Bingo
        } else if (gameType == 'other') { // SECTION Other Dungeon
            // Bla Bla Other Game
        // !SECTION other
        }


        return this.updateRegistry()
    // !SECTION Create Dungeon
    }

}


module.exports = GameInstance; 
