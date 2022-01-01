const fs = require('fs');
require("dotenv").config();
const wordnikToken = process.env.WORDNIK_API_KEY;

const WordListUtil = {
    getWordnikRandomWord: async function(wordnikToken) {
        const axios = require("axios").default;
        
        const options = `https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=noun&excludePartOfSpeech=proper-noun%20family-name%20given-name&minCorpusCount=1&minDictionaryCount=5&minLength=4&maxLength=15&api_key=${wordnikToken}`
        let word
        await axios.request(options).then((response) => {
                word = response.data.word.toLowerCase();
                console.log(response.headers['x-ratelimit-remaining-minute'])
        }).catch((error) => {
            return console.log(error);
        });

        return word;
    },
    getWordnikDef: async function(word, wordnikToken) {
        const axios = require("axios").default;
        const options = `https://api.wordnik.com/v4/word.json/${word}/definitions?limit=4&includeRelated=false&sourceDictionaries=all&useCanonical=false&includeTags=false&api_key=${wordnikToken}`
        
        let definitions
        await axios.request(options)
        .then((response) => {
            definitions = response.data;
            console.log(response.headers['x-ratelimit-remaining-minute'])
        })
        .catch((err) => {
            definitions = err.response
        })

        return definitions;
    }

}