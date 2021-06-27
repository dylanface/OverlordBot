module.export = (client) => {
client.games.bingo = new Discord.Collection();
client.games.bingo.calledNumbers = new Array();
client.games.bingo.gameNumber = new Number(); //?

client.games.ticTacToe = new Discord.Collection();
client.games.ticTacToe.activeGame = new Boolean();
}