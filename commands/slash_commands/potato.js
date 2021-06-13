module.exports = {
    name: 'potato',
    description: 'Spawns a potato!',
    options: {
        name: 'name',
        type: 'STRING',
        description: 'What is this potato boi\'s name?',
        required: true,
    },
    async execute(interaction, client) {

        const potatoName = await interaction.options.get('name').value;

        interaction.reply(`🥔 ← This is ${potatoName}`, { ephemeral: true })

    }
}