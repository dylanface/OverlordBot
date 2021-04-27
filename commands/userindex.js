module.exports = {
    name: 'userindex',
    description: "This can ban someone before they join the discord!",
    guildOnly: "true",
    args: 1,
    //guildExclusive: "140247578242580481",
    cooldown: 10,
    async execute(client, message, args, Discord) {
        const inputID = args[0];
        const channel = message.channel;

        const fetchUser = async id => client.users.fetch(id, true);

        const userObject = client.users.resolve(fetchUser(inputID));
        const user = client.users.resolveID(userObject);
        
        if (inputID.length === 18) {
            channel.send(
                `Right click the user's tag below to open context menu.
                ${user}`
                )

        } else {
            channel.send(`You entered ${user} which is not a valid user ID, try recopying the user's ID then running the command again.`)
        }


    }
}