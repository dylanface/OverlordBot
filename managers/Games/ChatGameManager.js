const Discord = require('discord.js');
const { codeBlock, inlineCode } = require('@discordjs/builders')

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
* Brief description of the class here
*/
class GuildChatGameManager {
    constructor(
        manager,
        guildId,
        client
    ) {
        this.guildId = guildId;
        this.client = client;
        this.manager = manager;

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
            let length = `{${word.length - 1},${word.length + 2}}`.replace(' ', '')
            let regex = new RegExp(`^[${word}][^ ]${length}$`, 'i');
            if (answer !== word) {
                if (!(regex.test(answer))) {
                    return;
                } else {
                    await this.incorrectAnswer(message);
                }
            } else {
                collector.stop();
                await this.correctAnswer(word, message, embed);
            }
        });
    }
    
    /** 
    * Logic for an incorrect answer in the listened channel.
    */
    async incorrectAnswer(message) {
        await message.react('❌');
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
            .setFooter(`Solved by ${message.author.username}`, message.author.displayAvatarURL({ dynamic: true }))
        console.log(message.author)
            
        if (definitions === null) {
            var definitionList = `No definition found for ${word}`
        } else {
            var definitionList = await definitions.map(d => {if(d.text) return `${d.partOfSpeech} - ${d.text?.replace(/<.+>/gi, '')}`}).join('\n')
        }
        correctAnswerEmbed.setDescription(`Correct answer was **${word}**\n${codeBlock(definitionList)}`);
        
        await embed.edit({ embeds: [correctAnswerEmbed] })
        //this.timedPrompt()
    }

    /** 
    * Fetch a random english word using the Wordnik API.
    */
    async randomWord() {
        const axios = require("axios").default;
        
        
        const options = `https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=noun&excludePartOfSpeech=proper-noun%2C%20family-name%2C%20given-name&minCorpusCount=2&minDictionaryCount=4&minLength=4&maxLength=15&api_key=${wordnikToken}`
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
        //
        const request = await axios.request(options).catch(err => { return null })
        const definitions = await request.data;
        return definitions;
    }
}


module.exports.ChatGameManager = ChatGameManager;
module.exports.GuildChatGameManager = GuildChatGameManager;