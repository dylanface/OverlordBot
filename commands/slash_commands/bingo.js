const BingoManager = require('../../managers/BingoManager.js');

module.exports = {
    name: 'bingo',
    description: "The main bingo command",
    options: [
        {
            name: 'match',
			type: 'SUB_COMMAND',
			description: 'The input which should be echoed back',
            options: [
                {
                    name: 'input',
				    type: 'STRING',
				    description: 'The input which should be echoed back',
                }
            ],
        }
    ],
    async execute(interaction, client) {
        const match = BingoManager.createGame(interaction.user)
        console.log(match)
    }
}