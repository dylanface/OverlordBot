module.exports = {
    name: 'topbalance',
    description: "Display a leaderboard of user balance's",
    defaultPermission: true,
    // permissions: [{
    //     id: '146719098343129088',
    //     type: 'ROLE',
    //     permission: true, 
    // }],
    async execute(interaction, client) {
    
        return interaction.reply(
            client.currency.sort((a, b) => b.balance - a.balance)
                .filter(user => client.users.cache.has(user.user_id))
                .first(10)
                .map((user, position) => `(${position + 1}) ${(client.users.cache.get(user.user_id).tag)}: ${user.balance} coins 💰`)
                .join('\n'),
            { code: true },
        );
        
    }
}