const Discord = require('discord.js');
const { GameInstance, gameRegistry } = require('../../managers/GameManager.js');

module.exports = {
    name: 'dragrace',
    description: "Let\'s join a dragrace game",
    options: [
        {
            name: 'bet', //? Is it possible to split this into either "all" or integer?
            type: 'INTEGER',
            description: 'Amount of coins to bet',
            required: true,
        },
        {
            name: 'carnumber',
            type: 'INTEGER',
            description: 'Car to bet on [1-8]',
            required: true,
        },
    ],
    execute(interaction, client) {
        
        let gameCount = 0;
        //TODO gameRegistry.get()
        
        //TODO if a race is active, join the race...
        /* if (game.gameState == 'Startup') {
            //join the race
        }
        //TODO if the last race ended within x seconds (cooldown)
        else if (game.gameState == 'Ended') {
            // if it's been x seconds/minutes since Ended...
            // if date.now() - game.dateOfCreation ...
            // remove old game then createGame(intiatingUser)
            //TODO deleteGame(gameCount)?
            createGame(intiatingUser)

        }
        else if (game.gameState == 'active') {
            //can't join anymore, race is running... calculate winners etc..
        }
        else {
            console.log('Dragrace somehow ended up in gamestate other than Active/Ended/Startup.')
        } */

        const betAmount = interaction.options.get('bet').value;
        const carNum = interaction.options.get('carnumber').value;

        const balance = client.currency.getBalance(interaction.user.id);

        if (betAmount > balance) return interaction.reply(`Sorry ${interaction.user}, you only have ${balance} coins.`);
        if (betAmount <= 0) return interaction.reply(`You can not bet a negative amount of coins, ${interaction.user}.`);

        client.currency.add(interaction.user.id, -payment);
        
        //TODO add user to dragrace game with bet amount
        return interaction.reply(`Successfully joined race with ${betAmount} coins 💰 on car ${carnumber}. Your remaining balance is ${client.currency.getBalance(interaction.user.id)} coins 💰`);

    }
    
}
    function createGame(name, initiatingUser) {
        gameCount++
        setTimeout(function () {
            //TODO players join race.
            // set gameState to Active
            // players join while Active
            

        }, 120000)
        .then()
        
        
        return game
    }
