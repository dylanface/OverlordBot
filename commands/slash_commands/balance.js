module.exports = {
    name: 'balance',
    description: "Show someone's balance",
    options: [{
        name: 'user',
        type: 'USER',
        description: 'User\'s balance to view',
        required: false,
    }],
    async execute(interaction, client) {

        if (interaction.options.get('user')) {
            var target = await client.users.fetch(interaction.options.get('user').value, true)

        } else {
            var target = await client.users.fetch(interaction.user.id, true)
        }

        return interaction.reply(`${target.tag} has ${client.currency.getBalance(target.id)} coins 💰`);

    }
}
