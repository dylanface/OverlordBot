const Discord = require('discord.js');
const { codeBlock, inlineCode } = require('@discordjs/builders')

class ChatGameManager {
    constructor(
        client
    ) {
        this.client = client;
        this.guildGameManagers = new Discord.Collection();
    }

    get guildGameManagers() {
        return this.guildGameManagers;
    }

    async getGuildChatGameManager(guildId) {
        const manager = this.guildGameManagers.get(guildId);
        if (manager) return manager;
        else return await this.addGuild(guildId);
    }

    async addGuild(guildId) {
        const gameManager = new GuildChatGameManager(guildId, this.client);
        this.guildGameManagers.set(guildId, gameManager);
        return gameManager;
    }

    async removeGuild(guildId) {
        const gameManager = this.guildGameManagers.get(guildId);
        if (gameManager) {
            gameManager.destroy();
            this.guildGameManagers.delete(guildId);
        }
    }
    
    
    
}

class GuildChatGameManager {
    constructor(
        guildId,
        client
    ) {
        this.guildId = guildId;
        this.client = client;

        this.fetchGuild()
    }

    async fetchGuild() {
        const guild = await this.client.guilds.fetch(this.guildId);
        this.guild = guild;
        await this.guild.channels.fetch(null, true)
        return this.guild;
    }

    async pickRandomChannel() {
        const everyone = this.guild.roles.everyone;
        const channels = await this.guild.channels.cache.filter(c => c.type === 'GUILD_TEXT' && c.permissionsFor(everyone).has('SEND_MESSAGES'));
        const randomChannel = channels.random();
        return randomChannel;
    }

    async setupGamePrompt() {
        const word = await this.randomWord();
        console.log(word)
        const shuffled = word.split('').sort(() => {return 0.5-Math.random()}).join('');

        const randomChannel = await this.pickRandomChannel();
        const answerTime = 'none'
        
        const gamePrompt = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setAuthor('Overlord Chat Games', this.client.user.displayAvatarURL())
            .addFields([
                {
                    name: 'Game Type',
                    value: 'Word Scramble',
                },
                {
                    name: 'Answer Channel',
                    value: randomChannel.name,
                },
                {
                    name: 'Answer Time',
                    value: answerTime,
                },
                {
                    name: 'Prompt',
                    value: shuffled,
                }
            ])
            .setDescription('**Active**')
            .setTimestamp();

        return { gamePrompt, randomChannel, word };
    }

    async beginChallenge() {
        const { gamePrompt, randomChannel, word } = await this.setupGamePrompt()

        const channel = await this.guild.channels.cache.find(c => c.name === 'commands-here');
        channel.send({ embeds: [gamePrompt] });
        this.openListener(randomChannel, word);
    }

    async openListener(channel, word) {
        const filter = m => m.content === word;
        const allotedTime = 30;

        const collector = channel.createMessageCollector(filter);
        collector.on('collect', async (message) => {
            if (message.author.bot) return;
            const answer = message.content;
            
                collector.stop();
                return channel.send({ content: 'You are correct' })
        });
    }

    async randomWord() {
        const axios = require("axios").default;
        
        
        const options = 'https://api.wordnik.com/v4/words.json/randomWord?hasDictionaryDef=true&includePartOfSpeech=noun&excludePartOfSpeech=proper-noun%2C%20family-name%2C%20given-name&minCorpusCount=4&minDictionaryCount=10&minLength=5&maxLength=12&api_key=pw27788oujqqn4c5osk0tk0s0ioso1c7dbsvhy5hxlgoa5bv6'
        let word
        await axios.request(options).then((response) => {
                word = response.data.word;
        }).catch((error) => {
            return console.log(error);
        });

        return word;
    }
}


module.exports.ChatGameManager = ChatGameManager;
module.exports.GuildChatGameManager = GuildChatGameManager;