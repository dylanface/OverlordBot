const Discord = require('discord.js');
const GameInstance = require('./GameManager.js');
const Canvas = require('../handlers/canvas_handler')

let gameCount = 0;

const generatedPairs = new Discord.Collection();
const drawnPairs = new Discord.Collection();

const masterB = new Discord.Collection();
const masterI = new Discord.Collection();
const masterN = new Discord.Collection();
const masterG = new Discord.Collection();
const masterO = new Discord.Collection();

for (let i = 1; i <= 15; i++) {
    masterB.set(i, 'B');
}
for (let i = 16; i <= 30; i++) {
    masterI.set(i, 'I');
}
for (let i = 31; i <= 45; i++) {
    masterN.set(i, 'N');
}
for (let i = 46; i <= 60; i++) {
    masterG.set(i, 'G');
}
for (let i = 61; i <= 75; i++) {
    masterO.set(i, 'O');
}

/** 
* Create a game that can be manipulated by the BingoManager.
* @param {string} name - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @param {object} initiatingUser - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @param {object} interaction - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @return {GameInstance} An Instance if a game within Overlord.
*/
let game;
exports.createGame = function(name, initiatingUser, interaction) {
    gameCount++
    
    game = new GameInstance(name, initiatingUser, gameCount, 'bingo')
    prepareMatch(game, interaction) 
    game.drawnBallsCanvasList = [];
}

const bingoJoin = new Discord.MessageButton()
    .setCustomID('joingame')
    .setLabel(`Join the game!`)
    .setStyle('PRIMARY')

const bingoDraw = new Discord.MessageButton()
    .setCustomID('drawball')
    .setLabel(`Draw a Bingo Ball!`)
    .setStyle('PRIMARY')

const bingoButtons = new Discord.MessageActionRow()
    .addComponents(
        [bingoJoin, bingoDraw]
);


/** 
 * Run all functions to prepare the match and notify users.
 * @param {object} game The game object you would like to manipulate
 * @param {object} interaction The interaction you would like to manipulate
 * @return {MatchObject} Returns the GameInstance that represents the match.
 */
async function prepareMatch(game, interaction) {
    generatePairs()
    
    const gamePrepEmbed = new Discord.MessageEmbed()
        .setTitle(`Bingo Game #${game.gameNumber}`)
        .setDescription(`\`\`\`diff\nA new Bingo Game is starting soon!\n-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\nJoin the bingo game with the button.\`\`\``)

    const message = await interaction.editReply({ embeds: [gamePrepEmbed], components: [bingoButtons] });
    const filter = interaction => interaction.customID !== null;

    const collector = message.createMessageComponentInteractionCollector(filter);

    collector.on('collect', async i => {
        if (game.gameState === 'Startup') {
            if (i.customID === 'joingame'){
                let user = i.user
                if (game.players.get(user.id)) {
                    console.log('Player already has channel in server')
                } else {
                    await game.addPlayer(user.id).catch(error => console.log(error))
                    createRoom(game, i)
                }
            } else if (i.customID === 'drawball') {
                await callNumber(game, i)
            } else {
                console.log('Button that wasn\'t join or draw was clicked somehow')
            }
        }
        i.update({ embeds: [gamePrepEmbed], components: [i.message.components[0]] });
    })
}

/** 
* Brief description of the function here.
* @summary If the description is long, write your summary here. Otherwise, feel free to remove this.
* @param {ParamDataTypeHere} parameterNameHere - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @return {ReturnValueDataTypeHere} Brief description of the returning value here.
*/
async function createRoom(game, interaction) {
    const guild = interaction.guild
    const bingo_roomsChannel = await guild.channels.cache.find(cat => cat.name === 'Bingo Rooms')
    if (!bingo_roomsChannel) {
        var bingoRooms = guild.channels.create('Bingo Rooms', 
        { type: 'category', position: 100 },
        )
    }

    const everyone = guild.roles.cache.find(role => role.name == '@everyone')
    
    const playerChannel = await guild.channels.create(interaction.user.username, 
        {
            topic: `${interaction.user.username}'s BINGO cards go here`,
            parent: bingo_roomsChannel || bingoRooms,
            permissionOverwrites: [
                {
                    id: everyone.id,
                    deny: ['CREATE_INSTANT_INVITE', 'VIEW_CHANNEL'],
                    type: "role",
                },
                {
                    id: interaction.user.id,
                    allow: ['VIEW_CHANNEL']
                },
            ],
        })
    if (playerChannel) {

        game.addPlayerChannel(interaction.user.id, playerChannel)
        sendBoardEmbed(playerChannel, game, interaction)
        

    }
}

/** 
* Brief description of the function here.
* @summary If the description is long, write your summary here. Otherwise, feel free to remove this.
* @param {ParamDataTypeHere} parameterNameHere - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @return {ReturnValueDataTypeHere} Brief description of the returning value here.
*/
function sendBoardEmbed(channel, game, interaction) {
  const buyBoards = new Discord.MessageButton()
    .setCustomID('buy_board')
    .setLabel(`Buy Board`)
    .setStyle('SECONDARY');

  const callBingo = new Discord.MessageButton()
    .setCustomID('call_bingo')
    .setLabel(`Call BINGO`)
    .setStyle('SUCCESS');

  const leaveGame = new Discord.MessageButton()
    .setCustomID('leave_game')
    .setLabel(`Leave Game`)
    .setStyle('DANGER');

  /* collector.on('collect', async i => {
        if (game.gameState === 'Startup') {
            if (i.customID === 'buy_board') {
                i.update({ embeds: [boardEmbed], components: [i.message.components[0]] });
                //TODO buy boards code
            }  else if (i.customID === 'call_bingo' ) { // Game in Startup, can't have a bingo
                i.update({ embeds: [boardEmbed], components: [i.message.components[0]] });
                console.log('Tried to claim bingo when game hasn't started');
            } else if (i.customID === 'leavegame') { // Should we refund boards if game hadn't started yet?
                i.update({ embeds: [boardEmbed], components: [i.message.components[0]] });
                let user = i.user
                if (game.players.get(user.id)) {
                    game.delPlayerChannel(user.id)
                    game.removePlayer(user.id)
                } else { // Error, cause this code should be inside their channel
                    console.log('User tried to delete channel they didn\'t have')
                } 
            } else { // Error, cause there should only be three button possibilities
                console.log('error button that doesn\'t exist was clicked')
            }
        } else if (game.gameState === 'Active') {
            if (i.customID === 'buy_board') { // Game Active can't buy more boards..
                i.update({ embeds: [boardEmbed], components: [i.message.components[0]] });
                console.log('User tried to buy a board after game was 'started')
            } else if (i.customID === 'call_bingo' ) {
                i.update({ embeds: [boardEmbed], components: [i.message.components[0]] });
                //TODO Go to function for checking user's bingo boards...
            } else if (i.customID === 'leavegame') {
                //Confirm leave during active game?
            } else { // Error, cause there should only be three button possibilities
                console.log('error button that doesn\'t exist was clicked')
            }
        } else if (game.gameState === 'Ended') {
            if (i.customID === 'buy_board' || i.customID === 'call_bingo' || i.customID === 'leave_game') {
                // Game has ended, Please wait for the next game to begin
                // Stats will be recorded automatically, and channel will be removed.
            } 
        }
                
                
    */

  const playerRoomButtons = new Discord.MessageActionRow().addComponents([
    buyBoards,
    callBingo,
    leaveGame,
  ]);

  const embedUserList = [];
  game.players.each((player) => {
    console.log(player);
    embedUserList.push(player.tag);
  });

  const boardEmbed = new Discord.MessageEmbed()
    .setTitle(`Welcome to Bingo ${interaction.user.username}!`)
    .setDescription(
      `Bingo Game #${game.gameNumber} will being shortly \nYou can use the button below to buy extra boards for $$$ coins!\nHere, have a board on the house!`
    )
    .addFields(
      {
        name: `Players:`,
        value: `${embedUserList}`,
      },
      {
        name: `yo`,
        value: `hi`,
        inline: true,
      }
    );

  channel.send({ embed: boardEmbed, components: [playerRoomButtons] });
  createBoards(game, interaction);
}
/** 
 * Generates all possible B I N G O | 1 - 75 | pairs to be randomly selected from.
 * @return {Collection} Results in a collections of all possible bingo pairs.
*/
async function generatePairs() {
    let bingoLetter;
    for (let i = 1; i <= 75; i++) {
        if (i <= 15) {
            bingoLetter = 'B';
        }
        else if (i > 15 && i <= 30) {
            bingoLetter = 'I';
        }
        else if (i > 30 && i <= 45) {
            bingoLetter = 'N';
        }
        else if (i > 45 && i <= 60) {
            bingoLetter = 'G';
        }
        else {
            bingoLetter = 'O';
        }
        generatedPairs.set(i, bingoLetter);
    }
    //** console.log(generatedPairs) // Worked as expected.
}

/** 
 * Call a bingo number.
 * @return {console.log} Returns the drawn pair as number - letter or an error
 */

async function callNumber(game, interaction) {
    let key = await generatedPairs.randomKey()
    let value = await generatedPairs.get(key)
    generatedPairs.delete(key)
    drawnPairs.set(key, value)
    //** console.log(drawnPairs.lastKey()) // Worked as expected.
    if (generatedPairs.has(key)) return console.log(`Uh oh a key has not been recorded properly`)
    // else interaction.channel.send(`${drawnPairs.last()}-${drawnPairs.lastKey()}`)
    Canvas.generateCanvas(game, drawnPairs, interaction);
}


// TODO Checking user's board vs drawn pairs.
// drawnPairs collection will have all drawn bingo numbers, Key = Number, Value = Letter.
// check bingo up till current called number



/**
 * Brief description of the function here.
 * @param {interaction} - The interaction of generated bingo board button press
 * @return {ReturnValueDataTypeHere} Brief description of the returning value here.
 */
async function createBoards(game, interaction) {
    const subB = masterB.clone();
    const subI = masterI.clone();
    const subN = masterN.clone();
    const subG = masterG.clone();
    const subO = masterO.clone();
    
    const allDrawn = [];
    
    for (let i = 0; i < 5; i++) {
        [subB, subI, subN, subG, subO].forEach(letter => {
            let drawnNumber = letter.randomKey()
            allDrawn.push(drawnNumber)
            letter.delete(drawnNumber)
        })
    }
    allDrawn[12] = 'free';
    //** console.log(allDrawn)  // Worked as expected.

    const player = game.getPlayer(interaction.user.id)
    if (player.get('boards')) {
        const boards = player.get('boards')
        if (boards.size < 5){
            boards.set(`board${boards.size}`, allDrawn)
        } else {
            //Too many boards?
        }
        
        
    }
    else if (!player.get('boards')) {
        const boards = player.set('boards', new Discord.Collection())
        boards.set(`board${boards.size}`, allDrawn)
    }




    const row1Buttons = new Discord.MessageActionRow()
    const row2Buttons = new Discord.MessageActionRow()
    const row3Buttons = new Discord.MessageActionRow()
    const row4Buttons = new Discord.MessageActionRow()
    const row5Buttons = new Discord.MessageActionRow()

    const row1 = await allDrawn.slice(0, 5).forEach(number => {
        row1Buttons.addComponents(
            new Discord.MessageButton()
                .setCustomID(`${number}_button`)
                .setLabel(`${number} `)
                .setStyle('PRIMARY'),
        );
    })

    const row2 = await allDrawn.slice(5, 10).forEach(number => {
        row2Buttons.addComponents(
            new Discord.MessageButton()
                .setCustomID(`${number}_button`)
                .setLabel(`${number} `)
                .setStyle('PRIMARY'),
        );
    })
    const row3 = await allDrawn.slice(10, 15).forEach(number => {
        row3Buttons.addComponents(
            new Discord.MessageButton()
                .setCustomID(`${number}_button`)
                .setLabel(`${number} `)
                .setStyle('PRIMARY'),
        );
    })
    const row4 = await allDrawn.slice(15, 20).forEach(number => {
        row4Buttons.addComponents(
            new Discord.MessageButton()
                .setCustomID(`${number}_button`)
                .setLabel(`${number} `)
                .setStyle('PRIMARY'),
        );
    })
    const row5 = await allDrawn.slice(20, 25).forEach(number => {
        row5Buttons.addComponents(
            new Discord.MessageButton()
                .setCustomID(`${number}_button`)
                .setLabel(`${number} `)
                .setStyle('PRIMARY'),
        );
    })
 
    const userChannel = player.get('playChannel')
    const message = await userChannel.send(` 🇧        🇮       🇳       🇬       🇴  `, { components: [row1Buttons, row2Buttons, row3Buttons, row4Buttons, row5Buttons] })

    // const message = interaction.fetchReply();
    const filter = i => i.customID !== null && i.user.id === interaction.user.id;

    const collector = message.createMessageComponentInteractionCollector(filter);

    const pressedButtons = [];

    collector.on('collect', async i => {
        i.message.components.forEach(row => {
            row.components.forEach(button => {
                if (button.customID === i.customID) {
                    button.setStyle('DANGER')
                    button.setDisabled(true)
                    pressedButtons.push(button)
                    //console.log(button.label)
                }
            })
        })
        //console.log(i.message.components[0])
        //TODO if mobile remove spacing between Bingo letters?
        await i.update({ content: ` 🇧        🇮       🇳       🇬       🇴  `, components: [i.message.components[0], i.message.components[1], i.message.components[2], i.message.components[3], i.message.components[4]] });
    });
    collector.on('end', collected => console.log(pressedButtons));

    //return allDrawn;
}
