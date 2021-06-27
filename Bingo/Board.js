const GameManager = require('./managers/GameManager.js')
const BingoManager = require('./managers/BingoManager.js')

module.exports = { 
    name: 'bingo_board',
    description: 'Purchase bingo boards that are sent to your board inventory',
    options: [{
        name: 'boards',
        type: 'INTEGER',
        description: 'Amount of boards to purchase',
        required: false,
    }],
    async execute(interaction, client) {
        // user buying extra cards:
        const balance = client.currency.getBalance(interaction.user.id);
        
        if (interaction.options.get('boards')) {
            const desiredBoards = await interaction.options.get('boards').value
            const gameNumber = client.games.bingo.gameNumber
            newCard(interaction.user, desiredBoards, gameNumber || null)
        }

        if (payment > balance) {
            return interaction.reply(`Sorry ${interaction.user}, you don't have enough coins to purchase ${desiredBoards}.`);
        } 
            
            
        client.currency.add(interaction.user.id, -payment);
        
    }
}


