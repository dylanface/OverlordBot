module.exports = (Discord, client, message) =>{
    console.log('Overlord is now online!');
    client.user.setPresence({
        status: 'online',
        activity: {
            name: 'your reactions',
            type: 'LISTENING'
        }
    });
}