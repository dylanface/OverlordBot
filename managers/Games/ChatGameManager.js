const Discord = require('discord.js');
const { codeBlock } = require('@discordjs/builders')
const GameManager = require('./GameManager');

require("dotenv").config();
const wordnikToken = process.env.WORDNIK_API_KEY;

/**
* Manages instances of a chat game manager for each Guild.
*/
class ChatGameManager {
    constructor(
        client
    ) {
        this.client = client;
        this.guildGameManagers = new Discord.Collection();
    }

    /** 
    * Fetch an instance of a Guild Manager for a specified guild, if it does not exist create one.
    */
    async getGuildChatGameManager(guildId) {
        const manager = this.guildGameManagers.get(guildId);
        if (manager) return manager;
        else return await this.addGuild(guildId);
    }

    /** 
    * Backend function to create and register a Guild Chat Game Manager..
    */
    async addGuild(guildId) {
        const gameManager = new GuildChatGameManager(this, guildId, this.client);
        this.guildGameManagers.set(guildId, gameManager);
        return gameManager;
    }

    /** 
    * Backend function to remove the specified Guild Manager from the Head Manager cache.
    */
    async removeGuild(guildId) {
        const gameManager = this.guildGameManagers.get(guildId);
        if (gameManager) {
            gameManager.destroy();
            this.guildGameManagers.delete(guildId);
            return true;
        }

    }
    
    async syncGuild(guildId, manager) {
        this.guildGameManagers.set(guildId, manager);
    }

    async refreshGuild(guildId) {
        const gameManager = this.guildGameManagers.get(guildId);
        gameManager.beginChallenge();
    }

    
}








/**
* Manages chat games that take place inside the created Guild Manager.
*/
class GuildChatGameManager extends GameManager {
    constructor(
        manager,
        guildId,
        client
    ) {
        super(null, manager, null, 'chat_based', null, null, guildId, client);
        this.guildId = guildId;
        this.incorrectAnswers = new Discord.Collection();

        this.fetchGuild()
    }
    
    /** 
    * Asynchronously fetch the Guild object and tie it to this Guild Chat Game Manager.
    */
    async fetchGuild() {
        const guild = await this.client.guilds.fetch(this.guildId);
        this.guild = guild;
        await this.guild.channels.fetch(null, true)
        return this.guild;
    }
    
    
    /** 
    * Backend function to choose a random channel that all Guild Users can chat in.
    */
    async pickRandomChannel() {
        const everyone = this.guild.roles.everyone;
        const channels = await this.guild.channels.cache.filter(c => c.type === 'GUILD_TEXT' && c.permissionsFor(everyone).has('SEND_MESSAGES'));
        const randomChannel = channels.random();
        return randomChannel;
    }
    
    /** 
    * Shuffle the passed word and return the shuffled version.
    */
    async shuffelWord(word) {
        word = word.split('');
      
        //Remove the first and the last letter
        let first = word.shift();
        if (word.length > 7) {
            var last = word.pop();
        } else {
            var last = ''
        }
      
        //Shuffle the remaining letters
        for (let i = word.length - 1; i > 0; i--) {
          let j = Math.floor(Math.random() * (i + 1));
          [word[i], word[j]] = [word[j], word[i]];
        }
      
        //Append and return
        return `${first} ${word.join(" ")} ${last}`
    }
    
    /** 
    * Call necessary functions and format responses in order to create game prompt.
    */
    async setupGamePrompt() {
        const word = await this.randomWord();
        console.log(word)
        const shuffled = await this.shuffelWord(word);

        

        const randomChannel = await this.pickRandomChannel();
        const answerTime = 'none'
        
        const gamePrompt = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setAuthor('Overlord Chat Games', this.client.user.displayAvatarURL())
            .addFields([
              {
                    name: 'Answer Channel',
                    value: `<#${randomChannel.id}>`,
                },
                {
                    name: 'Prompt',
                    value: shuffled,
                }
            ])
            .setDescription(`Unscramble the prompt and put your solution into the linked Answer Channel, first correct unscramble wins!`)
            .setTimestamp();

        return { gamePrompt, randomChannel, word };
    }
    
    /** 
    * Begin a scramble game in a random public channel.
    */
    async beginChallenge() {
        const { gamePrompt, randomChannel, word } = await this.setupGamePrompt()

        const channel = await this.guild.channels.cache.find(c => c.name === 'commands-here');
        const gameEmbed = await channel.send({ embeds: [gamePrompt] });
        this.openListener(randomChannel, word, gameEmbed);
    }
    
    /** 
    * Open a listener on the random channel in order to collect and respond to answers.
    */
    async openListener(channel, word, embed) {
        const filter = m => m.content.length <= word.length + 2;
        const allotedTime = 30;

        const collector = channel.createMessageCollector(filter);
        collector.on('collect', async (message) => {
            if (message.author.bot) return;
            const answer = message.content.toLowerCase().trim();
            let length = `{${word.length - 2},${word.length + 2}}`.replace(' ', '')
            const noSlash = word.replace(/-/g, '\-')
            let regex = new RegExp(`^[${noSlash}][^ ]${length}$`, 'i');
            if (answer !== word) {
                if (!(regex.test(answer))) {
                    return;
                } else {
                    await this.incorrectAnswer(answer, word, message, embed);
                }
            } else {
                collector.stop();
                await this.correctAnswer(word, message, embed);
            }
        });
    }

    /** 
    * Logic for a correct answer in the listened channel.
    */
    async correctAnswer(word, message, embed) {
        await message.react('✅');
        const definitions = await this.getWordInfo(word);
        const correctAnswerEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setAuthor(`Overlord Chat Games`, this.client.user.displayAvatarURL())
            .setFooter(`Solved by ${message.author.username} ↠ Next prompt will appear in 1 minutes`, message.author.displayAvatarURL({ dynamic: true }))
            
        if (definitions.status === 404) {
            var definitionList = `No definitions found`
        } else {
            var definitionList = await definitions.map(d => {if(d.text) return `${d.partOfSpeech} - ${d.text?.replace(/<.+>/gi, '')}`}).join('\n')
        }
        correctAnswerEmbed.setDescription(`Correct answer was **${word}**\n${codeBlock(definitionList)}\n`);
        
        await embed.edit({ embeds: [correctAnswerEmbed] })
        if (this.incorrectAnswers.has(embed.id)) this.clearIncorrectAnswers(embed.id)
        await this.moduPlayerScore(message.author.id, 1)
        this.timedPrompt(60000)
        this.getLeaderboard('codeBlock', null, message.channel, null)

    }

    timedPrompt(delayMS) {
        setTimeout(() => {
            this.beginChallenge();
        }, delayMS)
    }
    
    /** 
    * Logic for an incorrect answer in the listened channel.
    */
    async incorrectAnswer(answer, word, message, embed) {
        const answerBreak = answer.split('')
        const wordBreak = word.split('')
        let lettersOff = 0;

        for (let i = 0; i < wordBreak.length; i++) {
            if (wordBreak[i] === answerBreak[i]) continue;
            else lettersOff++;
        }

        const emoji = this.numberToEmoji(lettersOff)
        await message.react(emoji);

        if (this.incorrectAnswers.has(embed.id)) {
            const answers = this.incorrectAnswers.get(embed.id);
            answers.push(message);
        } else {
            const answers = [message];
            this.incorrectAnswers.set(embed.id, answers);
        }
        await this.moduPlayerScore(message.author.id, -1);
    }

    numberToEmoji(number) {
        if (number === 0) return '0️⃣';
        if (number === 1) return '1️⃣';
        if (number === 2) return '2️⃣';
        if (number === 3) return '3️⃣';
        if (number === 4) return '4️⃣';
        if (number === 5) return '5️⃣';
        if (number === 6) return '6️⃣';
        if (number === 7) return '7️⃣';
        if (number === 8) return '8️⃣';
        if (number === 9) return '9️⃣';
        if (number === 10) return '🔟';
    }

    clearIncorrectAnswers(embedId) {
        const answers = this.incorrectAnswers.get(embedId);
        if (answers.length >= 1) {
            for (let ans of answers) {
                ans.delete();
            }
            this.incorrectAnswers.delete(embedId);
                
        }
    }

    /** 
    * Fetch a random english word using the Wordnik API.
    */
    async randomWord() {
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
    }
    
    /** 
    * Fetch a definition for the given word.
    */
    async getWordInfo(word) { 
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
module.exports.ChatGameManager = ChatGameManager;
module.exports.GuildChatGameManager = GuildChatGameManager;