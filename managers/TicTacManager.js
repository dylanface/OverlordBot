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
    master = interaction.user
    const gameName = `Tic Tac Toe ${gameCount}`
    var game = new GameInstance(gameName, master, gameCount, 'ticTac', challenger)
    game.addPlayer(interaction.user.id)
    game.addPlayer(challengerID)
    prepareMatch(game, interaction) 
}

async function prepareMatch(game, interaction) {
    
    const ticTacThread = await interaction.channel.threads.create({
        name: `TicTacToe ${gameCount} - ${game.master.username} vs ${game.challenger.username}`, //we already use master and challenger here.
        //name: `TicTacToe ${gameCount} - ${master.username} vs ${challenger.username}`,
        autoArchiveDuration: 60,
        type: 'private_thread',
        reason: 'Thread for TicTacToe match'
    })
    .catch(console.error);
        
        game.addPlayerChannel(game.master.id, ticTacThread)
        game.addPlayerChannel(game.challenger.id, ticTacThread)
        ticTacThread.members.add(game.master);
        ticTacThread.members.add(game.challenger);
        
    Canvas.generateTicTacCanvas(game, interaction)
    generatePlayField(game, ticTacThread)
}

const row1Buttons = new Discord.MessageActionRow()
const row2Buttons = new Discord.MessageActionRow()
const row3Buttons = new Discord.MessageActionRow()

for (let i = 0; i < 3; i++){
    row1Buttons.addComponents(
        new Discord.MessageButton()
            .setCustomID(`${i}_button`)
            .setLabel(`-`)
            .setStyle('SECONDARY'),
    );
} 
for (let i = 3; i < 6; i++){
    row2Buttons.addComponents(
        new Discord.MessageButton()
            .setCustomID(`${i}_button`)
            .setLabel(`-`)
            .setStyle('SECONDARY'),
    );
} 
for (let i = 6; i < 9; i++){
    row3Buttons.addComponents(
        new Discord.MessageButton()
            .setCustomID(`${i}_button`)
            .setLabel(`-`)
            .setStyle('SECONDARY'),
    );
} 

async function generatePlayField(game, playThread) {

    const masterColl = await game.gameMasters.get(master.id);//game.master?no different sitch here
    const challengerColl = await game.players.get(challenger.id);//game.challenger? oh.. lol Also this wasn't in the code I saw, so new? Yes this is new i wrote in some stuff for eval
    //oh wait, this was down there before the await masterColl.set ...

    const message = await playThread.send({ content: `Tic Tac Toe`,  components: [row1Buttons, row2Buttons, row3Buttons] })
    const filter = i => i.customID !== null && i.user.id === interaction.user.id;
    const collector = message.createMessageComponentInteractionCollector(filter, {time: 500});

    const masterPressedButtons = [];
    const challengerPressedButton = [];

    let masterTurn = true;

    collector.on('collect', async i => {
        i.message.components.forEach(row => {
            row.components.forEach(button => {
                if (button.customID === i.customID) {
                    if (i.user.id === game.master.id && masterTurn === true) {
                        button.setLabel(`❌`)
                        button.setStyle('DANGER')
                        button.setDisabled(true)
                        masterPressedButtons.push(button)
                        masterTurn = false; 
                    } 
                    if (i.user.id === game.challenger.id && masterTurn === false) {
                        button.setLabel(`🔵`)
                        button.setStyle('PRIMARY')
                        button.setDisabled(true)
                        challengerPressedButton.push(button)
                        masterTurn = true;
                    }
                } 
            })
        })
    await evaluateBoard(game, i)
    await i.update({ content: `Tic Tac Toe`, components: [i.message.components[0], i.message.components[1], i.message.components[2]] })
    })

    collector.on('end', async collected => {
        //eval
        console.log(`${collected} ${masterPressedButtons} ${challengerPressedButton}`)
    })

    await masterColl.set('moves', masterPressedButtons)
    await challengerColl.set('moves', challengerPressedButton)
    


}

async function evaluateBoard(game, interaction) {
    const sliceWins = [
        [1, 5, 9],
        [3, 5, 7]
    ]
    const HorizonWins = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ]
    const VertaWins = [
        [1, 4, 7],
        [2, 5, 8],
        [3, 6, 9]
    ]

    const winTypes = [sliceWins, HorizonWins, VertaWins]

    const masterColl = await game.gameMasters.get(master.id);
    const challengerColl = await game.players.get(challenger.id);

    const masterMovesRaw = await masterColl.get('moves');
    const challengerMovesRaw = await challengerColl.get('moves');

    const masterMoves = await masterMovesRaw.map(i => i.customID.slice(0, 1));
    const challengerMoves = await challengerMovesRaw.map(i => i.customID.slice(0, 1));

    winTypes.forEach(type => { 
        type.forEach(winSet => {
            if (masterMoves.length > 3 /* && masterMoves.includes(winSet[1]) && masterMoves.includes(winSet[2]) */) {
                interaction.update({ content: 'hi', embeds: [
                    new Discord.MessageEmbed()
                    .setTitle('⊲ ⊲ ⊲ TicTacToe Game ⊳ ⊳ ⊳ ')
                    .setDescription(`${master.username} wins game ${game.name}!`)
                    .setTimestamp()
                ]
                })
            }
            else if (challengerMoves.includes(winSet[0]) && challengerMoves.includes(winSet[1]) && challengerMoves.includes(winSet[2])) {
                interaction.update({content: 'hi', embeds: [
                    new Discord.MessageEmbed()
                    .setTitle('⊲ ⊲ ⊲ TicTacToe Game ⊳ ⊳ ⊳ ')
                    .setDescription(`${challenger.username} wins game ${game.name}!`)
                    .setTimestamp()
                ]
                })
            }
        })
    })
}
