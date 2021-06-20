const Discord = require('discord.js');
const Canvas = require('canvas');

module.exports = {
    name: 'coinflip',
    description: "Flip a coin!",
    options: [{
        name: 'side',
        type: 'STRING',
        description: 'Heads or Tails?',
        required: true,
    }],
    defaultPermission: true,
    async execute(interaction, client) {

        const canvas = Canvas.createCanvas(450, 450);
	    const context = canvas.getContext('2d');

        const coinflip = await Canvas.loadImage('././media/tenor.gif');

	    context.drawImage(coinflip, 0, 0, canvas.width, canvas.height);

	    const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'coin.png');
        
    }
}