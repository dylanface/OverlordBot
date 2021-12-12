const mongoose = require('mongoose');

main().catch(err => console.log(err));
const word = new mongoose.Schema({
    id: String,
    vulgar: String,
    word: String,
    definitions: [String],
    wordInfo: {
        partOfSpeech: [String],
        plural: String,
        wordLength: String,
        pronunciation: [String],
        points: String
    }

});

const schema = mongoose.model('word_list').schema;
const wordModel = mongoose.model('word_list', schema);

const overlord = new wordModel({
    id: 'int',
    vulgar: 'false',
    word: 'test',
    definitions: ['test - this is a test'],
});

async function main() {
    await mongoose.connect('mongodb://myUserAdmin:Kindaquirkyuwu666@panel.dylanface.info/overlord?authSource=admin');
    await overlord.save();
    console.log('saved');
}

/*
    id: Number,
    vulgar: Boolean,
    word: String,
    definitions: [String],
    wordInfo: {
        partOfSpeech: [String],
        plural: Boolean,
        wordLength: Number,
        pronunciation: [String],
        language: String
        etymology: String
        points: Number
    },
    flagForReview: Boolean
*/
/*
let response = null
//todo response = plug the first word of file into https://dict-api.com/api/od/ + word

if (response != null){
    let flagForReview=False;
    word = response.query
    if (word != response.results[0].id) {
        flagForReview=True
        //wordInfo.plural = "maybe" maybe isn't a boolean oops.
        }
    definitions[ 
//todo Check if a bunch of different --> response.results[0].lexicalEntries[0].entries[0 to 3?].senses[0 to 3?].definitions[0 to 3?] exist, and add them?
//Need to manually check for things like vulgar or whatever, so I guess adding more definitions then deleting them later would be better? (more work)
    ]

    wordInfo.partOfSpeech = [
//todo response.results[0].lexicalEntries[0].lexicalCategory.text.. Check for lexicalEntries[1,2,3..] see if they are different, could be noun and verb etc.
    ]
    wordInfo.wordLength = word.length
    pronunciation = [ response.results[0].lexicalEntries[0].entries[0].pronunciations[0].phoneticSpelling, response.results[0].lexicalEntries[0].entries[0].pronunciations[0].audioFile]
    wordInfo.language = response.results[0].language
    if (wordInfo.language !== "en-gb") {flagForReview=True}
    wordInfo.etymology = response.results[0].lexicalEntries[0].entries[0].etymologies[0]
}

//todo Remove word when done using it, and go onto the next one.
*/