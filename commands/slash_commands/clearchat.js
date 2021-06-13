module.exports = {
    name: 'clearchat',
    description: "This can clear the channel you execute the command in",
    options: {
        name: 'input',
        type: 'INTEGER',
        description: 'The number of messages to clear',
        required: true,
    },
    defaultPermission: false,
    permissions: [{
        id: '819638095997698088',
        type: 'ROLE',
        permission: true,
    }],
    async execute(interaction, client) {
        const deleteInput = interaction.options.get('input').value;
        interaction.channel.bulkDelete(deleteInput);
        interaction.reply(`${deleteInput} messages have been deleted`, { ephemeral: true })

    }
}