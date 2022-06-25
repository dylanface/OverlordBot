const { CommandInteraction, Client } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: 'yoinkies',
    description: 'Yoink an emote from another guild',
    options: [
        {
            name: 'emotes',
            type: 'STRING',
            description: 'What you wanna yoink you little yoinker',
            required: true,
        },
        {
            name: 'name',
            type: 'STRING',
            description: 'The name of your new emote',
            required: true,
        }
    ],
    data: new SlashCommandBuilder()
        .setName('yoinkies')
        .setDescription('Yoink an emote from another guild')
        .addStringOption(option =>
            option.setName('emotes')
            .setDescription('What you wanna yoinkies you little yoinker')
            .setRequired(true)
            )
        .addStringOption(option =>
            option.setName('name')
            .setDescription('The name of your new emote(s)')
            .setRequired(true)
            ),
    /**
     * @param { CommandInteraction } interaction The command interaction object.
     * @param { Client } client The discord client that called this command.
     */
    async execute(interaction, client) {
        
        const rawEmotes = interaction.options.getString('emotes')
        const name = interaction.options.getString('name')

        const onlyDigits = /\D/g;

        const names = name.split(' ')

        
        const emojiIds = rawEmotes
        .split("<")
        .map((word) => {
            const id = word.replace(onlyDigits, "");
            if (word.includes("a:")) {
                return `a_${id}`;
            } else return id;
        }).filter((k) => k !== undefined && k !== '')
        
        console.log(emojiIds);
        if (names.length !== emojiIds.length) return await interaction.reply('You provided a mismatched amount of names and emojis')

        const successfulEmojis = [];

        for (const emoji of emojiIds) {
           const url = emoji.includes("a_")
             ? `https://cdn.discordapp.com/emojis/${emoji.replace(
                 onlyDigits,
                 ""
               )}.gif`
             : `https://cdn.discordapp.com/emojis/${emoji}.png`;

            
            const inputName = names[emojiIds.indexOf(emoji)]
            if (!inputName) continue;

            await interaction.guild.emojis
            .create(url, inputName)
            .then((emoji) =>
                successfulEmojis.push(inputName)
            )
            .catch(console.error);
        }

        await interaction.reply(`Added the emojis: ${successfulEmojis.join(' ')}`)
    }
}