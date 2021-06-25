module.exports = {
    name: 'balance',
    description: "Show someone's balance",
    options: [{
        name: 'user',
        type: 'USER',
        description: 'User\'s balance to view',
        required: false,
    }],
    defaultPermission: true,
    // permissions: [{
    //     id: '146719098343129088',
    //     type: 'ROLE',
    //     permission: true, 
    // }],
    async execute(interaction, client) {

        if (interaction.options.get('user')) {
            var target = await client.users.fetch(interaction.options.get('user').value, true)

        } else {
            var target = interaction.user.id
        }

        return interaction.reply(`${target.tag} has ${client.currency.getBalance(target.id)} coins 💰`);

        
    }
}