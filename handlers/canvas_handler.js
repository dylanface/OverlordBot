const Canvas = require('canvas');
const Discord = require('discord.js');

/** 
* Brief description of the function here.
* @param {collection} numbers - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @param {object} interaction - Brief description of the parameter here. Note: For other notations of data types, please refer to JSDocs: DataTypes command.
* @return {Image Buffer} Brief description of the returning value here.
*/

exports.generateCanvas = async function(game, numbers, interaction) {
	const channel = interaction.channel;
	if (!channel) return;

	const canvas = Canvas.createCanvas(700, 300);
	const context = canvas.getContext('2d');

	const background = await Canvas.loadImage('media/bingoTable.png');
	context.drawImage(background, 0, 0, canvas.width, canvas.height);

	context.strokeStyle = '#74037b';
	context.strokeRect(0, 0, canvas.width, canvas.height);

	// context.font = '28px sans-serif';
	// context.fillStyle = '#ffffff';
	// context.fillText('Welcome to the server,', canvas.width / 2.5, canvas.height / 3.5);

	// context.font = applyText(canvas, `${member.displayName}!`);
	// context.fillStyle = '#ffffff'; 
	// context.fillText(`${member.displayName}!`, canvas.width / 2.5, canvas.height / 1.8); 
    
    const Letter = numbers.last(4)
    const Number = numbers.lastKey(4)
    let bigLetter
    let medLetter
    let smallLetter
    let miniLetter
    let bigColor
    let medColor
    let smallColor
    let miniColor
    switch (numbers.size) {
        case 0:
            console.log(`Oh NO NO HELP NOOOO AHHHHHH!`)
        break;

        case 1:
            bigLetter = [Letter[0] ,Number[0]]
            medLetter = [null, null]
            smallLetter = [null, null]
            miniLetter = [null, null]
        break;

        case 2:
            bigLetter = [Letter[1], Number[1]]
            medLetter = [Letter[0], Number[0]]
            smallLetter = [null, null]
            miniLetter = [null, null]
        break;

        case 3:
            bigLetter = [Letter[2], Number[2]]
            medLetter = [Letter[1], Number[1]]
            smallLetter = [Letter[0], Number[0]]
            miniLetter = [null, null]
        break;

        default:
            bigLetter = [Letter[3], Number[3]]
            medLetter = [Letter[2], Number[2]]
            smallLetter = [Letter[1], Number[1]]
            miniLetter = [Letter[0], Number[0]]
        break;
    }
    
    //Set colors
    switch (bigLetter[0]) {
        case 'B':
            bigColor = 'blue';
        break;
        case 'I':
            bigColor = 'red';
        break;
        case 'N':
            bigColor = 'orange';
        break;
        case 'G':
            bigColor = 'green';
        break;
        case 'O':
            bigColor = 'purple';
        break;
        default:
            bigColor = 'white';
        break;
    }
    //Set colors
    switch (medLetter[0]) {
        case 'B':
            medColor = 'blue';
        break;
        case 'I':
            medColor = 'red';
        break;
        case 'N':
            medColor = 'orange';
        break;
        case 'G':
            medColor = 'green';
        break;
        case 'O':
            medColor = 'purple';
        break;
        default:
            medColor = 'white';
        break;
    }
    //Set colors
    switch (smallLetter[0]) {
        case 'B':
            smallColor = 'blue';
        break;
        case 'I':
            smallColor = 'red';
        break;
        case 'N':
            smallColor = 'orange';
        break;
        case 'G':
            smallColor = 'green';
        break;
        case 'O':
            smallColor = 'purple';
        break;
        default:
            smallColor = 'white';
        break;
    }
    //Set colors
    switch (miniLetter[0]) {
        case 'B':
            miniColor = 'blue';
        break;
        case 'I':
            miniColor = 'red';
        break;
        case 'N':
            miniColor = 'orange';
        break;
        case 'G':
            miniColor = 'green';
        break;
        case 'O':
            miniColor = 'purple';
        break;
        default:
            miniColor = 'white';
        break;
    }

    
    // console.log(`big color: ${bigColor}, big letter: ${bigLetter[0]}`)
    // console.log(`medium color: ${medColor}, medium letter: ${medLetter[0]}`)
    // console.log(`small color: ${smallColor}, small letter: ${smallLetter[0]}`)
    // console.log(`mini color: ${miniColor}, mini letter: ${miniLetter[0]}`)

    context.shadowColor = "#333";
    context.shadowBlur = 10;
    context.shadowOffsetX = 0;
    context.shadowOffsetY = 10;
    // Big
	context.beginPath();
	context.arc(568, 150, 122, 0, Math.PI * 2, true);
	context.closePath();
    let gradient = context.createRadialGradient(568,150,112,568,150,80);
    gradient.addColorStop(0,bigColor);
    gradient.addColorStop(1, 'white');
    context.fillStyle = gradient;
    context.fill(5, 5, 200, 200)
    

    //Add numbers.last letter and numbers.lastkey number

    // Medium
    context.beginPath()
    context.arc(350, 91, 92, 0, Math.PI * 2, true);
    context.closePath();
    gradient = context.createRadialGradient(350, 91, 92, 350, 91, 65);
    gradient.addColorStop(0, medColor);
    gradient.addColorStop(1, 'white');
    context.fillStyle = gradient;
    context.fill(5, 5, 200, 200)

    // Small
    context.beginPath()
    context.arc(182, 150, 66, 0, Math.PI * 2, true);
    context.closePath();
    gradient = context.createRadialGradient(182, 150, 66, 182, 150, 48);
    gradient.addColorStop(0, smallColor);
    gradient.addColorStop(1, 'white');
    context.fillStyle = gradient;
    context.fill(5, 5, 200, 200)

    // Mini
    context.beginPath()
    context.arc(75, 236, 54, 0, Math.PI * 2, true);
    context.closePath();
    gradient = context.createRadialGradient(75, 236, 54, 75, 236, 38);
    gradient.addColorStop(0, miniColor);
    gradient.addColorStop(1, 'white');
    context.fillStyle = gradient;
    context.fill(5, 5, 200, 200)

    context.shadowColor = null;
    context.shadowBlur = null;
    context.shadowOffsetX = null;
    context.shadowOffsetY = null;

    context.font = 'small-caps bold 80px cursive';
    context.textAlign = 'center';
    context.fillStyle = 'black';

    //big
    context.fillText(`${bigLetter[0]}`, 568, 140);
    context.fillText(`${bigLetter[1]}`, 568, 210);

    //medium
    if(medLetter[0]) {
        context.font = 'small-caps bold 60px cursive';
        context.fillText(`${medLetter[0]}`, 350, 80);
        context.fillText(`${medLetter[1]}`, 350, 130);
    }

    //small
    if(smallLetter[0]) {
        context.font = 'small-caps bold 50px cursive';
        context.fillText(`${smallLetter[0]}`, 182, 145);
        context.fillText(`${smallLetter[1]}`, 182, 185);
    }

    //mini
    if(miniLetter[0]) {
        context.font = 'small-caps bold 36px cursive';
        context.fillText(`${miniLetter[0]}`, 75, 235);
        context.fillText(`${miniLetter[1]}`, 75, 265);
    }


	// const avatar = await Canvas.loadImage(member.user.displayAvatarURL({ format: 'jpg' }));
	// context.drawImage(avatar, 25, 25, 200, 200);

	const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'welcome-image.png');
    const CanvasList = await game.drawnBallsCanvasList;

        if (CanvasList[0]) {
            CanvasList[0].delete()
            CanvasList.shift()
        }

        const drawnBallsCanvas = await channel.send(attachment)
        game.drawnBallsCanvasList.push(drawnBallsCanvas)
}

