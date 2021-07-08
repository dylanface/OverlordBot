module.exports = {
    name: 'addcoins',
    description: "admin add coins to player",
    options: [
        {
        name: 'user',
        type: 'USER',
        description: 'User\'s balance to add to',
        required: true,
        },
        {
            name: 'payment',
            type: 'INTEGER',
            description: 'Amount of coins to add',
            required: true,
        },
    ],
    async execute(interaction, client) {
        var target = await client.users.fetch(interaction.options.get('user').value, true)
        var amount = await interaction.options.get('payment').value
        await client.currency.add(target.id, amount);
        return interaction.reply(`${target.tag} has ${client.currency.getBalance(target.id)} coins 💰`);

    }
}
