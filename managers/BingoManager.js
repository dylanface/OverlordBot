const bingo = client.games.bingo



const mockBoard = [
    [0,5,10,15,20],
    [1,6,11,16,21],
    [2,7,null,17,22],
    [3,8,13,18,23],
    [4,9,14,19,24],
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
