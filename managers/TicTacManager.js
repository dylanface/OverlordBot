const Discord = require('discord.js');
const GameInstance = require('./GameManager.js');

let gameCount = 0;
let challenger;
let master;

exports.createGame = async function(interaction, client) {
    gameCount++
    const { value: challengerID } = interaction.options.get('challenger');
    challenger = await client.users.fetch(challengerID, true);
    master = interaction.user
    const gameName = `Tic Tac Toe ${gameCount}`
    game = new GameInstance(gameName, master, gameCount, 'ticTac', challenger)
    game.addPlayer(interaction.user.id)
    game.addPlayer(challengerID)
    prepareMatch(game, interaction) 
}

const emptyButton = [
    new Discord.MessageButton()
    .setCustomID('empty')
    .setLabel(`-`)
    .setStyle('SECONDARY')
]

const playerButton = [
    new Discord.MessageButton()
    .setCustomID('player')
    .setLabel(`❌`)
    .setStyle('DANGER')
    .setDisabled(true)
]

const challengerButton = [
    new Discord.MessageButton()
    .setCustomID('challenger')
    .setLabel(`🔵`)
    .setStyle('PRIMARY')
    .setDisabled(true)
]

async function prepareMatch(game, interaction) {
    
    const ticTacThread = await interaction.channel.threads.create({
        name: `TicTacToe ${gameCount} - ${game.initiatingUser.username} vs ${game.challengers.username}`,
        autoArchiveDuration: 60,
        type: 'private_thread',
        reason: 'Thread for TicTacToe match'})
        .catch(console.error);
        
        game.addPlayerChannel(game.initiatingUser.id, ticTacThread)
        game.addPlayerChannel(game.challengers.id, ticTacThread)
        ticTacThread.members.add(game.initiatingUser);
        ticTacThread.members.add(game.challengers);
        
    const  gameReply = 
        `\`\`\`    ❌ ⊲ TicTacToe Game ⊳ ⭕ 
${interaction.user.tag} ⚔️ ${challenger.tag}
    Your match has been created!\`\`\``
    
    const replyEmbed = new Discord.MessageEmbed()
        .setDescription(gameReply)
        .setTimestamp()
            
    
    await interaction.editReply({ embeds: [replyEmbed] })
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


    const message = await playThread.send({ content: `Tic Tac Toe`,  components: [row1Buttons, row2Buttons, row3Buttons] })



    const filter = i => i.customID !== null && i.user.id === interaction.user.id;

    const collector = message.createMessageComponentInteractionCollector(filter);

    const masterPressedButtons = [];
    const challengerPressedButton = [];

    let masterTurn = true;

    collector.on('collect', async i => {
        i.message.components.forEach(row => {
            row.components.forEach(button => {
                if (button.customID === i.customID) {
                    if (i.user.id === game.initiatingUser.id && masterTurn === true) {
                        button.setLabel(`❌`)
                        button.setStyle('DANGER')
                        button.setDisabled(true)
                        masterPressedButtons.push(button)
                        masterTurn = false; 
                    } 
                    if (i.user.id === game.challengers.id && masterTurn === false) {
                        button.setLabel(`🔵`)
                        button.setStyle('PRIMARY')
                        button.setDisabled(true)
                        challengerPressedButton.push(button)
                        masterTurn = true;
                    }
                } 
            })
        })
    await i.update({ content: `Tic Tac Toe`, components: [i.message.components[0], i.message.components[1], i.message.components[2]] })
    })
    collector.on('end', async collected => {
        //eval
    })

    const masterColl = await game.gameMasters.get(master.id);
    const challengerColl = await game.challengers.get(challenger.id);

    await masterColl.set('moves', masterPressedButtons)
    await challengerColl.set('moves', challengerPressedButton)

}

async function evaluateBoard(game, interaction) {
    
    

    // masterPressedButtons
    // challengerPressedButton
}