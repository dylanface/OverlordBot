module.exports = {
    name: 'bingo_draw',
    description: 'Calls a new bingo number.',
    execute(interaction, client) {
        const rand;
        do {
            rand = Math.floor(Math.random() * 75)+1;
        } 
        while (client.games.bingo.calledNumbers.includes(rand));
        
        client.games.bingo.calledNumbers.push(rand); //add number to called numbers
        if (rand <= 15) // Add letter before number
            message.channel.send('B' + rand);
        else if (rand > 15 && rand <= 30)
            message.channel.send('I' + rand);
        else if (rand > 30 && rand <= 45)
            message.channel.send('N' + rand);
        else if (rand > 45 && rand <= 60)
            message.channel.send('G' + rand);
        else
            message.channel.send('O' + rand);
    }
}

