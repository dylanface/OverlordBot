 const Discord = require('discord.js')
    
    
    const GameInstance = require('./GameManager.js');

    let gameCount = 0;
    
    const generatedPairs = new Discord.Collection();
    const drawnPairs = new Discord.Collection();
    
    const masterB = new Discord.Collection();
    const masterI = new Discord.Collection();
    const masterN = new Discord.Collection();
    const masterG = new Discord.Collection();
    const masterO = new Discord.Collection();
    for (let i = 1; i <= 15; i++) {
        masterB.set(i, 'B');
    }
    for (let i = 16; i <= 30; i++) {
        masterI.set(i, 'I');
    }
    for (let i = 31; i <= 45; i++) {
        masterN.set(i, 'N');
    }
    for (let i = 46; i <= 60; i++) {
        masterG.set(i, 'G');
    }
    for (let i = 61; i <= 75; i++) {
        masterO.set(i, 'O');
    }



    exports.createGame = function(initiatingUser) {
        gameCount++
        
        const game = new GameInstance(initiatingUser, gameCount, 'bingo')
        return game

    }


    /** 
     * Run all functions to prepare the match and notify users.
     * @return {MatchObject} Returns the GameInstance that represents the match.
     */
    async function prepareMatch() {
        generatePairs()
        const bingoChannel = interaction.guild.channels.cache.find(ch => ch.name === 'channel-2');
        bingoChannel.send({content: `A new Bingo Game is being prepared!` });
        bingoChannel.send({content: `Bingo Game # ${gameNumber} is about to begin.` });
        bingoChannel.send({content: `-=-=-=-=-=-=-=-` });
        bingoChannel.send({content: `Get bingo cards with /BingoCard` });
        bingoChannel.send({content: `The first card is Free!` });

    }
    
    /** 
     * Generates all possible B I N G O | 1 - 75 | pairs to be randomly selected from.
     * @return {Collection} Results in a collections of all possible bingo pairs.
     */
    async function generatePairs() {
        let bingoLetter;
        for (let i=1; i<=75; i++) {
            if (i <= 15) {
                bingoLetter = 'B';
            }
            else if (i > 15 && i <= 30) {
                bingoLetter = 'I';
            }
            else if (i > 30 && i <= 45) {
                bingoLetter = 'N';
            }
            else if (i > 45 && i <= 60) {
                bingoLetter = 'G';
            }
            else {
                bingoLetter = 'O';
            }
            generatedPairs.set(i, bingoLetter);
        }
        //** console.log(generatedPairs) // Worked as expected.
    }
    
    /** 
     * Call a bingo number.
     * @return {console.log} Returns the drawn pair as number - letter or an error
     */
    async function callNumber() {
        let key = await generatedPairs.randomKey()
        let value = await generatedPairs.get(key)
        generatedPairs.delete(key)
        drawnPairs.set(key, value)
        //** console.log(drawnPairs.lastKey()) // Worked as expected.
        // TODO Add in output to channel, or return the key/value drawn..
        if (generatedPairs.has(key)) return console.log(`Uh oh a key has not been recorded properly`)
        
    }
    
    
    // TODO Checking user's board vs drawn pairs.
    // drawnPairs collection will have all drawn bingo numbers, Key = Number, Value = Letter.
    // check bingo up till current called number
    
    
    
    
    
    
    
    // TODO: Creating boards..
    
    /** 
     * Brief description of the function here.
     * @param {Integer} amount - The amount of randomly generated bingo boards to create.
     * @return {ReturnValueDataTypeHere} Brief description of the returning value here.
     */
    
    async function createBoards(amount) {
        const subB = masterB.clone();
        const subI = masterI.clone();
        const subN = masterN.clone();
        const subG = masterG.clone();
        const subO = masterO.clone();
        
        var allDrawn = [];
        
        for (let i = 0; i < 5; i++) {
            [subB, subI, subN, subG, subO].forEach(letter => {
                let drawnNumber = letter.randomKey()
                allDrawn.push(drawnNumber)
                letter.delete(drawnNumber)
            })
        }
        
        allDrawn[12] = 'free';
        //** console.log(allDrawn)  // Worked as expected.
        
    }
 /*
    const mockBoard = [
        [0,5,10,15,20],
        [1,6,11,16,21],
        [2,7,'free',17,22],
        [3,8,13,18,23],
        [4,9,14,19,24],
    ]
    
    const emptyBoard = [
        [``,``,``,``,``],
        [``,``,``,``,``],
        [``,``,`Free Space`,``,``],
        [``,``,``,``,``],
        [``,``,``,``,``],
    ]
    
     async function newCard(user, amount, gameNumber){
        
        var usedNums = new Array(76); 
        
        
        const column = new Array(0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3,4,4,4,4,4)
        
        for (let i=0 ; i<24 ; i++){
            if (i == 12){
                setFreeSpace();
                continue;
            }
            
            let square = column[i] * 15;
            
            do {
                var newNum = square + Math.floor(Math.random() * 15) + 1;
            }
            while (usedNums[newNum]); 
        }
    }
    
    async function setFreeSpace() {
        
    } */
    