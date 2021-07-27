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
            this.gameMasters = new Discord.Collection();
            this.rewards = new Discord.Collection();
            this.gameState = 'Startup';
            this.gameID = Discord.SnowflakeUtil.generate();
            this.guild = guild;

            this.gameUUID = uuidv4();

            this.gameMasters.set(this.master.id, new Discord.Collection());
            gameRegistry.set(this.gameID, this);
            
        }

        async updateRegistry() {
            gameRegistry.set(this.gameID, this);
            console.log(`Game Instance ${this.gameID} updated in registry.`);
        }

        async addPlayer(id) {
            const user = await this.players.get(id);
            if (user) return console.log(`This user already exists`);
            else {
                let user = this.players.set(id, new Discord.Collection());
            }
            return this.updateRegistry()
        }

        async removePlayer(id) {
            const user = await this.players.get(id);
            if (user) this.players.delete(id);
            return this.updateRegistry()
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
            return this.updateRegistry()
        }

        //TODO: getLeaderboard(amount)? rank players scores in the game instance
        //if amount between numbers: display number of users on leaderboard

        async addMaster(id) {
            const gameMasters = await this.gameMasters.get(id);
            if (gameMasters) return this.updateRegistry()
            else {
                let gameMasters = await this.gameMasters.set(id, new Discord.Collection());
                return this.updateRegistry()
            }
        }

        getMaster(id) {
            return this.gameMasters.get(id);
        }

        clearModifiers() {
            this.modifiers.clear();
            return this.updateRegistry()
        }

        setGameType(gameType) {
            this.gameType = gameType;
            return this.updateRegistry()
        }

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

        changeGameState(gameState) {
            this.gameState = gameState;
            return this.updateRegistry()
        }

        endGame() {
            if (this.gameState === 'Active') {
                this.gameState = 'Ended';
                if(this.getPlayer(this.master.id).has('playChannel')) {
                    this.delPlayerChannel(this.master.id)
                }
                gameRegistry.delete(this.gameID);
            }   

            return console.log(`There are currently ${gameRegistry.size} games in the registry.`);
        }

        startGame() {
            if (this.gameState === 'Startup') {
                this.gameState = 'Active';
            } 
            return this.updateRegistry()
        }

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
            }
            else {
                console.log('Player didn\'t have playChannel to delete')
                return this.updateRegistry()
            }

            setTimeout(() => channel.delete(), 10000)
        }
       
        getPlayerChannel(id) {
            const player = this.players.get(id)
            let channel = player.get('playChannel')
            return channel;
        }

        //TODO: getCoinsInPot

        //TODO: Assigning rewards
        //getWinners(#OfWinners?)

        /** 
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
            
            if (gameType == 'bingo') {
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
                    .setCustomID('refresh')
                    .setLabel(`Refresh`)
                    .setStyle('PRIMARY')
                const startGame = new Discord.MessageButton()
                    .setCustomID('startGame')
                    .setLabel(`Start Game`)
                    .setStyle('SUCCESS')
                const endGame = new Discord.MessageButton()
                    .setCustomID('endGame')
                    .setLabel(`End Game`)
                    .setStyle('DANGER')

                const modButtons = new Discord.MessageActionRow()
                    .addComponents(
                        [refresh, startGame, endGame]
                    );

                const dungeonPanel = await dungeonChannel.send({ embeds: [dungeonEmbed], components: [modButtons] })

                const filter = interaction => interaction.customID !== null;
                const collector = dungeonPanel.createMessageComponentInteractionCollector(filter);

                collector.on('collect', async i => {
                    if (i.customID === 'refresh'){
                        //meh
                    } else if (i.customID === 'startGame'){
                        game.startGame()
                    } else if (i.customID === 'endGame'){
                        game.endGame();
                        collector.stop()
                    }
                    i.message.embeds[0].fields[0].value = `${game.players.size}`
                    i.message.embeds[0].fields[1].value = `${game.gameState}`
                    i.update({ embeds: i.message.embeds, components: [i.message.components[0]] });
                });

                collector.on('end', collected => {
                    //TODO End game stuff...?
                    dungeonChannel.delete()
                });

            }

            return this.updateRegistry()
        }

}


module.exports = GameInstance, gameRegistry; 
