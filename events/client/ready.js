module.exports = (Discord, client, message) =>{
    console.log('Overlord is now online!');
    client.user.setPresence({
        status: 'online',
        activity: {
            name: '50 Shades of Grey',
            type: 'LISTENING'
        }
    });
}