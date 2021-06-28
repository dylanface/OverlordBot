const Discord = require('discord.js');
const myIntents = Discord.Intents.ALL;
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION"], intents: myIntents });

//const bingo = client.games.bingo

const { GameInstance } = require('./GameManager');

// const game = new GameInstance()
const generatedPairs = new Discord.Collection();
const drawnPairs = new Discord.Collection();

generatePairs()
callNumber()
    async function prepareMatch() {
        
        

        // .randomKey(amount)
        // Obtains unique random key(s) from this collection.
        // Returns: * or Array<*>
        // A single key if no amount is provided or an array
    }
    
    async function generatePairs() {
        var bingoLetter;
        for (let i=1; i<=75; i++) {
            if (i <= 15) {

                bingoLetter = 'B';
            } // Add letter before number
            else if (i > 15 && i <= 30) {//Do you even need the >'s here? It won't get this far if it's not >15...?
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
        console.log(generatedPairs)
    }
    // TODO Finish: Call bingo numbers
    async function callNumber() {
        //randomKey fetches the number
        //random fetched the letter
        let key = await generatedPairs.randomKey()
        let value = await generatedPairs.get(key)
        generatedPairs.delete(key)
        drawnPairs.set(key, value)
        console.log(drawnPairs)
        if (generatedPairs.has(key)) return console.log(`Uh oh a key has not been recorded properly`)
        //remove key/value from generatedPairs and add to drawnPairs...
        
    }

    
    // TODO Checking user's board vs drawn pairs.
    
    //array of numbers, and current called number
    //check bingo up till current called number
    
    
    const mockBoard = [
        [0,5,10,15,20],
        [1,6,11,16,21],
        [2,7,null,17,22],
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
    
    /*      From Draw.js drawing numbers:
    const rand;
    do {
        rand = Math.floor(Math.random() * 75)+1;
    }
    while (client.games.bingo.calledNumbers.includes(rand));
    
    
    matching up the current "const column" numbers with multiplied by 15, 
    and then adding in random 1-15 to that number in theory should get you 1-75?
    
    I was just thinking, it bugs me a bit that the draw script does random 1-75, 
    and the bingomanger wants to do random 1-15 plus column*15...
    
    Makes sense in a way, less randomness I guess, cause you'll always pull 
    a number from the column you want to fill.
    
    
    */
   
   
   async function setFreeSpace() {
       
   }
