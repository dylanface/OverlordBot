const Discord = require('discord.js');
const GameInstance = require('./GameManager.js');
const Canvas = require('../handlers/canvas_handler.js')

let gameCount = 0;

/** 
* SECTION Create Game
* Creates the game and the channel used for Tic Tac Toe
* @param {object} interaction - The interaction used to request a game.
* @param {object} client - Static client passthrough.
*/
exports.createGame = async function(interaction, client) {
    interaction.deferReply();
    const guild = await interaction?.guild.fetch();
    if (guild?.features.includes('PRIVATE_THREADS')) {var threadType = 'GUILD_PRIVATE_THREAD'}
    else {var threadType = 'GUILD_PUBLIC_THREAD'}

    gameCount++
    const { value: challengerId } = interaction.options.get('challenger');
    const challenger = await client.users.fetch(challengerId, true);
    const master = await interaction.user
    const gameName = `TicTacToe - ${gameCount}`;
    var game = new GameInstance(gameName, master, gameCount, 'ticTacToe', challenger)
    game.addPlayer(interaction.user.id)
    game.addPlayer(challengerId)



    const channel = await guild.channels.fetch(interaction.channelId);
    const ticTacThread = await channel.threads.create({
        name: `TicTacToe ${gameCount} - ${game.master.username} vs ${game.challenger.username}`, //we already use master and challenger here.
        //name: `TicTacToe ${gameCount} - ${master.username} vs ${challenger.username}`,
        autoArchiveDuration: 60,
        type: threadType,
        reason: 'Thread for TicTacToe game'
    })
    .catch(console.error);
        
        game.addPlayerChannel(game.master.id, ticTacThread)
        game.addPlayerChannel(game.challenger.id, ticTacThread)
        await ticTacThread.members.add(game.master);
        await ticTacThread.members.add(game.challenger);
        
    interaction.editReply({ content: `Tic Tac Toe ${master.username} vs ${challenger.username}` })
    await Canvas.generateTicTacCanvas(game, ticTacThread)
    generatePlayField(game, ticTacThread)
} // !SECTION Create Game

/** 
* SECTION Rematch
* Creates the rematch game using the same channel as previous game
* @param {GameInstance} oldGame - The existing game to create a rematch for.
* @param {object} ticTacToeThread - The interaction used to request a game.
*/
async function rematch(oldGame, ticTacToeThread) {
    console.log(`${oldGame.name} has been rematched!`)
    gameCount++;
    const gameName = `TicTacToe - ${gameCount}`;
    const challenger = oldGame.master;
    const master = oldGame.challenger;
    let thread = ticTacToeThread;
    var rematch = new GameInstance(gameName, master, gameCount, 'ticTacToe', challenger, 'rematch')
    await rematch.addPlayer(master.id)
    await rematch.addPlayer(challenger.id)
    rematch.addPlayerChannel(rematch.master.id, thread)
    rematch.addPlayerChannel(rematch.challenger.id, thread)
    await Canvas.generateTicTacCanvas(rematch, thread)
    generatePlayField(rematch, thread)
} // !SECTION Rematch

const row1Buttons = new Discord.MessageActionRow()
const row2Buttons = new Discord.MessageActionRow()
const row3Buttons = new Discord.MessageActionRow()

for (let i = 1; i < 4; i++){
    row1Buttons.addComponents(
        new Discord.MessageButton()
            .setCustomId(`${i}_button`)
            .setLabel(`-`)
            .setStyle('SECONDARY'),
    );
} 
for (let i = 4; i < 7; i++){
    row2Buttons.addComponents(
        new Discord.MessageButton()
            .setCustomId(`${i}_button`)
            .setLabel(`-`)
            .setStyle('SECONDARY'),
    );
} 
for (let i = 7; i < 10; i++){
    row3Buttons.addComponents(
        new Discord.MessageButton()
            .setCustomId(`${i}_button`)
            .setLabel(`-`)
            .setStyle('SECONDARY'),
    );
} 

/** 
* SECTION Create TicTacToe
* Creates the Tic Tac Toe board and records button presses
* @param {GameInstance} game - The game instance to generate a field for.
* @param {object} playThread - The thread or channel to place the field.
*/
async function generatePlayField(game, playThread) {

    const master = game.master;
    const challenger = game.challenger;

    const masterColl = await game.masters.get(master.id);
    const challengerColl = await game.players.get(challenger.id);

    const message = await playThread.send({ content: `Tic Tac Toe`,  components: [row1Buttons, row2Buttons, row3Buttons] })
    const filter = i => i.customId !== null && i.user.id === interaction.user.id;
    const collector = message.createMessageComponentCollector(filter);

    if (!masterColl.has('moves') || !challengerColl.has('moves')) { 
        await masterColl.set('moves', [])
        var masterMoves = await masterColl.get('moves');
        await challengerColl.set('moves', [])
        var challengerMoves = await challengerColl.get('moves');
    } else {
        var masterMoves = await masterColl.get('moves');
        var challengerMoves = await challengerColl.get('moves');
    }

    let masterTurn = true;
    game.startGame();

    collector.on('collect', async i => {
        if (game.gameState === 'Ended') {
            await i.update({ content: `Tic Tac Toe`, components: [i.message.components[0], i.message.components[1], i.message.components[2]] })
            return collector.stop();
        }
        i.message.components.forEach(row => {
            row.components.forEach(button => {
                if (button.customId === i.customId) {
                    if (i.user.id === game.master.id && masterTurn === true) {
                        button.setLabel(`❌`)
                        button.setStyle('DANGER')
                        button.setDisabled(true)
                        masterMoves.push(button)
                        masterTurn = false;
                    } else if (i.user.id === game.challenger.id && masterTurn === false) {
                        button.setLabel(`🔵`)
                        button.setStyle('PRIMARY')
                        button.setDisabled(true)
                        challengerMoves.push(button)
                        masterTurn = true;
                    } else {
                        // Not your turn
                    }
                } 
            })
        })
        evaluateBoard(game, playThread)
        await i.update({ content: `Tic Tac Toe`, components: [i.message.components[0], i.message.components[1], i.message.components[2]] })
    })
    
    collector.on('end', async collected => {
        
        // 
    })

} // !SECTION Create TicTacToe

/** 
* SECTION Evaluate Board
* Evaluates the board for wins, starting from the 3rd move by first player
* @param {GameInstance} game - The game instance to evaluate.
* @param {object} playThread - The thread or channel containing the current field.
*/
async function evaluateBoard(game, playThread) {
    const sliceWins = [
        ['1', '5', '9'],
        ['3', '5', '7']
    ]
    const horizonWins = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9']
    ]
    const vertaWins = [
        ['1', '4', '7'],
        ['2', '5', '8'],
        ['3', '6', '9']
    ]

    const winTypes = [sliceWins, horizonWins, vertaWins]

    const master = game.master;
    const challenger = game.challenger;

    const masterColl = await game.masters.get(master.id);
    const challengerColl = await game.players.get(challenger.id);

    const masterMovesRaw = await masterColl.get('moves');
    const challengerMovesRaw = await challengerColl.get('moves');
    
    const masterMoves = await masterMovesRaw.map(i => i.customId.slice(0, 1));
    const challengerMoves = await challengerMovesRaw.map(i => i.customId.slice(0, 1));
    let doBreak = false

    if (masterMoves.length > 2) {
        for (type of winTypes) {
            for (winSet of type) {
                if (masterMoves.includes(winSet[0]) && masterMoves.includes(winSet[1]) && masterMoves.includes(winSet[2])) {
                    let winner = game.master;
                    generateResultsEmbed(game, playThread, winner)
                    doBreak = true;
                    break;
                } else if (challengerMoves.includes(winSet[0]) && challengerMoves.includes(winSet[1]) && challengerMoves.includes(winSet[2])) {
                    let winner = game.challenger;
                    generateResultsEmbed(game, playThread, winner)
                    doBreak = true;
                    break;
                } else if (masterMoves.length >= 5 && challengerMoves.length >= 4 && !(masterMoves.includes(winSet) && masterMoves.includes(winSet[1]) && masterMoves.includes(winSet[2]))) { // Checked last in case player wins on final move.
                    let winType = 'tie';
                    generateResultsEmbed(game, playThread, winType)
                    doBreak = true;
                    break;
                }
            }
            if (doBreak) {
                game.softEnd();
                break;
            } //needs to be in an if..
        }
    }

} // !SECTION Evaluate Board

/** 
* SECTION Generate Results
* Generate an embed with the results of the Tic Tac Toe game.
* @summary Print result in a discord embed with player stats for each player in the game as fields; along with the result of the game on top, whether it be a tie or a winners name.
* @param {GameInstance} game - Game instance .
* @param {object} thread - Thread to send the MessageObject to.
* @param {object, string} result - Either 'tie' or one of the two opponents.
* @return {MessageObject} The embed being sent to the play thread and the collector to listen for button interactions.
*/
async function generateResultsEmbed(game, thread, result) {
    
    const embed = new Discord.MessageEmbed()
    .setTitle('Tic Tac Toe')
    .setDescription(`Game over!`)
 
    if (result === 'tie') {
        embed.setFooter(`The game was a tie!`)
        embed.setColor('#888888')
    } else {
        embed.setFooter(`${result.username} won the game!`)
        if (result === game.master) {
            embed.setColor('#FF0000')
        } else {
            embed.setColor('#0000FF')
        }
    }

    // const masterStats = await game.gameMasters.get(master.id).get('stats');
    // const challengerStats = await game.players.get(challenger.id).get('stats');

    const embedStats = new Discord.MessageEmbed()
    .setTitle('Stats')
    .setDescription(`Stats for ${game.master.username}`)
    .setColor('#FF0000')
    // .addField('Wins', masterStats.wins, true)
    // .addField('Losses', masterStats.losses, true)
    // .addField('Draws', masterStats.draws, true)

    const embedStats2 = new Discord.MessageEmbed()
    .setTitle('Stats')
    .setDescription(`Stats for ${game.challenger.username}`)
    .setColor('#0000FF')
    // .addField('Wins', challengerStats.wins, true)
    // .addField('Losses', challengerStats.losses, true)
    // .addField('Draws', challengerStats.draws, true)

    const endGame = new Discord.MessageButton()
        .setCustomId('end_game')
        .setLabel(`End Game`)
        .setStyle('SECONDARY');

    const replay = new Discord.MessageButton()
        .setCustomId('re_match')
        .setLabel(`Rematch`)
        .setStyle('SUCCESS');

    const embedButtons = new Discord.MessageActionRow().addComponents([
        endGame,
        replay,
    ]);
    
    const message = await thread.send({ embeds: [embed], components: [embedButtons] });
    // await thread.send({ embeds: [embedStats]});
    // await thread.send({ embeds: [embedStats2]});
    const filter = i => i.customId === 'end_game' || 're_match';
    const collector = await message.channel.createMessageComponentCollector(filter);
    //console.log(message)
    collector.on('collect', async i => {
        //console.log(i)
        if (i.customId == 'end_game') {
            await i.channel.send({embeds: [new Discord.MessageEmbed().setTitle(`${game.name}`).setDescription(`\`\`\`Game Ended! Channel will be deleted in 10 seconds.\`\`\``)]})
            game.endGame()
            collector.stop()
        }
        else if (i.customId == 're_match') {
            console.log('rematch was clicked')
            collector.stop();
            await rematch(game, thread);
        }
    })

    collector.on('end', async collected => {
        // TODO Stats and Stuff
    })

} // !SECTION Generate Results

