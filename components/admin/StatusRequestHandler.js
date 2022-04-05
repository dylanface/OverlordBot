const express = require('express');
const cors = require('cors');

function Init(client) {
    const app = express();
    const port = process.env.STATUS_PORT || 32901;
    
    app.use(cors())
 
    const listener = app.listen(port, function(err){
        if (err) console.log("Error in server setup")
        console.log("Server listening on Port", port);
    })

    app.get('/status-report', function(req, res){
        getStats(client).then(stats => {
            res.status(200).json(stats);
        })
        .catch(err => {
            res.status(404).send(err);
        })
    });

}

async function getStats(client) {


    const stats = [
        { name: 'Overlord Status', stat: 'Online', uptime: process.uptime() },
        { name: 'Overlord Managed Guilds', stat: client.guilds.cache.size },
        { name: 'Overlord Managed Users', stat: client.totalMembers },
    ]

    return stats;
}

module.exports.StartStatusRequestHandler = Init;