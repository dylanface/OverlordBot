module.exports = {
    name: 'new_game',
    description: 'New Game Startup',
    guildOnly: true,
    options: [{
        name: 'game_name',
        type: 'STRING',
        description: 'Select game to set up:',
        required: true,
        choices: [
            { 
                name: 'Bingo',
                value: 'Bingo'
            },
            { 
                name: 'Test2',
                value: 'Test2'
            },
        ],
    }],
    defaultPermission: true,
    
    async execute(interaction, client) {
        const gameType = interaction.options.get('game_name').value
        
        if (gameType == 'Bingo') {
            client.games.bingo.calledNumbers.length = 0;
            client.games.bingo.gameNumber += 1;
            const gameNumber = client.games.bingo.gameNumber
            const bingoChannel = interaction.guild.channels.cache.find(ch => ch.name === 'reward-log');
            bingoChannel.send({content: `A new Bingo Game is being prepared!` });
            bingoChannel.send({content: `Bingo Game # ${gameNumber} is about to begin.` });
            bingoChannel.send({content: `-=-=-=-=-=-=-=-` });
            bingoChannel.send({content: `Get bingo cards with /BingoCard` });
            bingoChannel.send({content: `The first card is Free!` });
        } else if (gameType == 'Test2') {
            //game two etc.
        } else {
            //error?
        }
    }
}