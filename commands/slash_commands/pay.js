module.exports = {
    name: 'pay',
    description: "Pay another user the defined amount",
    options: [
        
        {
        name: 'payment',
        type: 'INTEGER',
        description: 'Amount of coins to transfer',
        required: true,
        },
        {
        name: 'recipient',
        type: 'USER',
        description: 'Recipient of the payment',
        required: true,
        },
],
    defaultPermission: true,
    async execute(interaction, client) {
        const recipientID = interaction.options.get('recipient').value;
        const payment = interaction.options.get('payment').value;
        
        const recipient = await client.users.fetch(recipientID, true);
        const balance = client.currency.getBalance(interaction.user.id);

        if (payment > balance) return interaction.reply(`Sorry ${interaction.user}, you only have ${balance} coins.`);
        if (payment <= 0) return interaction.reply(`You can not transfer a negative amount of coins, ${interaction.user}.`);

        client.currency.add(interaction.user.id, -payment);
        client.currency.add(recipient.id, payment);

        return interaction.reply(`Successfully transferred ${payment} coins 💰 to ${recipient.tag}. Your remaining balance is ${client.currency.getBalance(interaction.user.id)} coins 💰`);

    }
}