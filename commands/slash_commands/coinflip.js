const Discord = require('discord.js');

module.exports = {
    name: 'coinflip',
    description: "Flip a coin!",
    options: [{
        name: 'side',
        type: 'STRING',
        description: 'Heads or Tails?',
        required: true,
        choices: [
            { 
                name: 'Heads',
                value: 'Heads'

            },
            { 
                name: 'Tails',
                value: 'Tails'

            },

        ],
    }],
    async execute(interaction, client) {

        await interaction.defer({ ephemeral: true });

        const sideInput = interaction.options.get('side').value;

        const flipEmbed = new Discord.MessageEmbed()
            .setTitle(`... Flipping Coin`)
            .setImage('https://media.giphy.com/media/QSRTwOPADVcR3XufBZ/giphy.gif')

        await interaction.editReply({ embeds: [flipEmbed] })

        if (Math.random() >= 0.5) {
            var result = 'Heads';
        }   else {
            var result = 'Tails';
        }

        const resultEmbed = new Discord.MessageEmbed()

        async function modifyScore() {

        }

        if (result == sideInput) {
            resultEmbed.setTitle(`🎉 You Won `)
            resultEmbed.setDescription(`✅ The coin landed on **${result}**`)
            resultEmbed.setFooter(`You got a reward!`, 'https://creazilla-store.fra1.digitaloceanspaces.com/cliparts/60815/golden-dollar-coin-clipart-md.png')

            client.currency.add(interaction.user.id, 1);
            const rewardChannel = interaction.guild.channels.cache.find(ch => ch.name === 'reward-log');
            rewardChannel.send({content: `${interaction.user.tag} was given 1 coin` });

            modifyScore()

        } else {
            resultEmbed.setTitle(`💔 You Lost `)
            resultEmbed.setDescription(`❌ The coin landed on **${result}**`)
        }

            setTimeout(function(){ 
                interaction.editReply({ embeds: [resultEmbed] })
            }, 1500);
        
    }
}