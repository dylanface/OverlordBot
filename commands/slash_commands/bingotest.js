const BingoManager = require('../../managers/BingoManager.js');
const Canvas = require('../../handlers/canvas_handler');
const Discord = require('discord.js');

module.exports = {
    name: 'bingotest',
    description: "Make a board",
    async execute(interaction, client) {
        
        Canvas.generateCanvas(null, interaction)
        
        
    }
}