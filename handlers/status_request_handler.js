const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');



function Init(client) {
    const api_route = '/api/v2';

    const app = express();
    const port = process.env.STATUS_PORT || 32901;
    
    app.use(cors())
    app.use(bodyParser.json());
 
    app.listen(port, function(err) {
        if (err) console.log("Error in server setup")
        console.log("Server listening on Port", port);
    })

    app.get(`${api_route}/status-report`, (req, res) => {
        getStats(client).then(stats => {
            res.status(200).json({stats});
        })
        .catch(err => {
            res.status(404).send(err);
        })
    });

    app.post(`${api_route}/where-is-overlord`, (req, res) => {
        const data = req.body;
        
        overlordInGuilds(data, client).then(result => {
        res.status(200).json(result);
        })
        .catch(err => res.status(404).send(err)); 
    })

    app.get(`${api_route}/users`, (req, res) => {
        if (req.headers.authorization = process.env.AUTH_TOKEN) {
            res.status(200).json(client.users.cache.toJSON());
        } else {
            res.status(403).send("Unauthorized");
        }
    })

}








// Worker function for express server data requests.

async function getStats(client) {

    const stats = {
        status: {
            state: true,
            uptime: process.uptime(),
        },
        guildSize: client.guilds.cache.size,
        totalMembers: client.totalMembers,
    }

    // const stats = [
    //     { name: 'Overlord Status', stat: 'Online', uptime: process.uptime() },
    //     { name: 'Overlord Managed Guilds', stat: client.guilds.cache.size },
    //     { name: 'Overlord Managed Users', stat: client.totalMembers },
    // ]

    return stats;
}

async function overlordInGuilds(data, client) {
    const guilds = client.guilds.cache.map(guild => guild.id);
    const query = data.map(guild => guild.id);

    const result = query.filter(guild_id => guilds.includes(guild_id));

    return JSON.stringify(result);
}

module.exports.StartRequestHandler = Init;