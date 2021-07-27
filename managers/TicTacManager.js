const Discord = require('discord.js');
const GameInstance = require('./GameManager.js');
const Canvas = require('../handlers/canvas_handler.js')

let gameCount = 0;
let master;
let challenger;

exports.createGame = async function(interaction, client) {
    gameCount++
    const { value: challengerID } = interaction.options.get('challenger');
    challenger = await client.users.fetch(challengerID, true);
    master = await interaction.user
    const gameName = `TicTacToe - ${gameCount}`;
    var game = new GameInstance(gameName, master, gameCount, 'ticTacToe', challenger)
    game.addPlayer(interaction.user.id)
    game.addPlayer(challengerID)
    preparegame(game, interaction) 
}

async function preparegame(game, interaction) {
    
    const ticTacThread = await interaction.channel.threads.create({
        name: `TicTacToe ${gameCount} - ${game.master.username} vs ${game.challenger.username}`, //we already use master and challenger here.
        //name: `TicTacToe ${gameCount} - ${master.username} vs ${challenger.username}`,
        autoArchiveDuration: 60,
        type: 'private_thread',
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
}

async function rematch(oldGame, ticTacThread) {
    console.log('making rematch')
    gameCount++;
    const gameName = `TicTacToe - ${gameCount}`;
    master = oldGame.master;
    challenger = oldGame.challenger;
    let thread = ticTacThread;
    var rematch = new GameInstance(gameName, master, gameCount, 'ticTacToe', challenger, 'rematch')
    await rematch.addPlayer(master.id)
    await rematch.addPlayer(challenger.id)
    rematch.addPlayerChannel(rematch.master.id, thread)
    rematch.addPlayerChannel(rematch.challenger.id, thread)
    await Canvas.generateTicTacCanvas(rematch, thread)
    generatePlayField(rematch, thread)
}

const row1Buttons = new Discord.MessageActionRow()
const row2Buttons = new Discord.MessageActionRow()
const row3Buttons = new Discord.MessageActionRow()

for (let i = 1; i < 4; i++){
    row1Buttons.addComponents(
        new Discord.MessageButton()
            .setCustomID(`${i}_button`)
            .setLabel(`-`)
            .setStyle('SECONDARY'),
    );
} 
for (let i = 4; i < 7; i++){
    row2Buttons.addComponents(
        new Discord.MessageButton()
            .setCustomID(`${i}_button`)
            .setLabel(`-`)
            .setStyle('SECONDARY'),
    );
} 
for (let i = 7; i < 10; i++){
    row3Buttons.addComponents(
        new Discord.MessageButton()
            .setCustomID(`${i}_button`)
            .setLabel(`-`)
            .setStyle('SECONDARY'),
    );
} 

async function generatePlayField(game, playThread) {

    const masterColl = await game.gameMasters.get(master.id);
    const challengerColl = await game.players.get(challenger.id);

    const message = await playThread.send({ content: `Tic Tac Toe`,  components: [row1Buttons, row2Buttons, row3Buttons] })
    const filter = i => i.customID !== null && i.user.id === interaction.user.id;
    const collector = message.createMessageComponentInteractionCollector(filter);

    this.masterPressedButtons = [];
    this.challengerPressedButton = [];

    let masterTurn = true;
    let gameEnd = false;
    game.startGame();

    collector.on('collect', async i => {
        i.message.components.forEach(row => {
            row.components.forEach(button => {
                if (button.customID === i.customID) {
                    if (i.user.id === game.master.id && masterTurn === true) {
                        button.setLabel(`❌`)
                        button.setStyle('DANGER')
                        button.setDisabled(true)
                        this.masterPressedButtons.push(button)
                        masterTurn = false; 
                    } else if (i.user.id === game.challenger.id && masterTurn === false) {
                        button.setLabel(`🔵`)
                        button.setStyle('PRIMARY')
                        button.setDisabled(true)
                        this.challengerPressedButton.push(button)
                        masterTurn = true;
                    } else {
                        // Not your turn
                    }
                } 
            })
        })
    gameEnd = await evaluateBoard(game, playThread)
    await i.update({ content: `Tic Tac Toe`, components: [i.message.components[0], i.message.components[1], i.message.components[2]] })
    if (gameEnd) collector.stop();
    })
    
    collector.on('end', async collected => {
        // Not Needed
    })

    await masterColl.set('moves', masterPressedButtons)
    await challengerColl.set('moves', challengerPressedButton)

}

async function evaluateBoard(game, playThread) {
    const sliceWins = [
        ['1', '5', '9'],
        ['3', '5', '7']
    ]
    const HorizonWins = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9']
    ]
    const VertaWins = [
        ['1', '4', '7'],
        ['2', '5', '8'],
        ['3', '6', '9']
    ]

    const winTypes = [sliceWins, HorizonWins, VertaWins]

    const masterColl = await game.gameMasters.get(master.id);
    const challengerColl = await game.players.get(challenger.id);

    const masterMovesRaw = await masterColl.get('moves');
    const challengerMovesRaw = await challengerColl.get('moves');
    
    const masterMoves = await masterMovesRaw.map(i => i.customID.slice(0, 1));
    const challengerMoves = await challengerMovesRaw.map(i => i.customID.slice(0, 1));
    console.log(masterMoves.length)
    if (masterMoves.length > 2) {
        winTypes.forEach(type => { 
            type.forEach(async winSet => {
                if (masterMoves.includes(winSet[0]) && masterMoves.includes(winSet[1]) && masterMoves.includes(winSet[2])) {
                    let winner = game.master;
                    generateResultsEmbed(game, playThread, winner)
                    return true;
                } else if (challengerMoves.includes(winSet[0]) && challengerMoves.includes(winSet[1]) && challengerMoves.includes(winSet[2])) {
                    let winner = game.challenger;
                    generateResultsEmbed(game, playThread, winner)
                    return true;
                } else if (masterMoves.length >= 5 && challengerMoves.length >= 4) { // TODO this has an edge case where the game is declared a tie before the last move is made
                    let winType = 'tie';
                    generateResultsEmbed(game, playThread, winType)
                    return true;
                }
            })
        })
    } else {
        return false;
    }
}

/** 
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
    .setColor(0xFF0000)
    // .addField('Wins', masterStats.wins, true)
    // .addField('Losses', masterStats.losses, true)
    // .addField('Draws', masterStats.draws, true)

    const embedStats2 = new Discord.MessageEmbed()
    .setTitle('Stats')
    .setDescription(`Stats for ${game.challenger.username}`)
    .setColor(0x0000FF)
    // .addField('Wins', challengerStats.wins, true)
    // .addField('Losses', challengerStats.losses, true)
    // .addField('Draws', challengerStats.draws, true)

    const endGame = new Discord.MessageButton()
        .setCustomID('end_game')
        .setLabel(`End Game`)
        .setStyle('SECONDARY');

    const replay = new Discord.MessageButton()
        .setCustomID('re_match')
        .setLabel(`Rematch`)
        .setStyle('SUCCESS');

    const embedButtons = new Discord.MessageActionRow().addComponents([
        endGame,
        replay,
    ]);
    
    const message = await thread.send({ embeds: [embed], components: [embedButtons] });
    await thread.send({ embeds: [embedStats]});
    await thread.send({ embeds: [embedStats2]});
    //const filter = i => i.customID !== null;
    const filter = i => i.customID === 'end_game' || 're_match';
    const collector = await message.channel.createMessageComponentInteractionCollector(filter);
    //console.log(message)
    collector.on('collect', async i => {
        //console.log(i)
        if (i.customID == 'end_game') {
            game.endGame()
            collector.stop()
            //TODO end game stuff
        }
        else if (i.customID == 're_match') {
            console.log('rematch was clicked')
            await rematch(game, thread);
            game.softEnd();
            collector.stop();
        }
    })

    collector.on('end', async collected => {
        // Save stats stuff?
    })

}
