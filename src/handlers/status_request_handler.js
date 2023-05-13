const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const path = require("path");

function Init(client) {
  const api_route = "/api/v2";
  client.totalMembers = 0;

  const app = express();
  const port = process.env.STATUS_PORT || 32901;

  app.use(cors());
  app.use(bodyParser.json());

  app.listen(port, function (err) {
    if (err) console.log("Error in server setup");
    console.log("Server listening on Port", port);
  });

  app.get(`${api_route}/status-report`, (req, res) => {
    getStats(client)
      .then((stats) => {
        res.status(200).json({ stats });
      })
      .catch((err) => {
        res.status(404).send(err);
      });
  });

  app.post(`${api_route}/where-is-overlord`, (req, res) => {
    const data = req.body;

    overlordInGuilds(data, client)
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => res.status(404).send(err));
  });

  app.get(`${api_route}/users`, (req, res) => {
    if (req.headers.authorization === process.env.AUTH_TOKEN) {
      res.status(200).json(client.users.cache.toJSON());
    } else {
      res.status(403).send("Unauthorized");
    }
  });

  // app.get(
  //   `${api_route}/storage/:trackerId([0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89AB][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12})/media/:fileName(\\w+\.\\w+)`,
  //   (req, res) => {
  //     const { trackerId, fileName } = req.params;

  //     console.log(`Request captured: ${req.path}`);
  //     res.send(req.params);
  //   }
  // );

  // app.get(`${api_route}/storage/:fileName(\\w+\.\\w+)`, (req, res) => {
  //     const { fileName } = req.params;

  //     res.sendFile(path.join(__dirname, `../images/${fileName}`));
  // });
}

// Worker function for express server data requests.

async function getStats(client) {
  const stats = {
    status: {
      name: "Overlord Status",
      state: true,
      uptime: process.uptime(),
    },
    guildSize: {
      name: "Overlord Guilds",
      stat: client.guilds.cache.size,
    },
    totalMembers: {
      name: "Overlord Subjects",
      stat: client.totalMembers,
    },
  };

  // const stats = [
  //     { name: 'Overlord Status', stat: 'Online', uptime: process.uptime() },
  //     { name: 'Overlord Managed Guilds', stat: client.guilds.cache.size },
  //     { name: 'Overlord Managed Users', stat: client.totalMembers },
  // ]

  return stats;
}

async function overlordInGuilds(data, client) {
  const guilds = client.guilds.cache.map((guild) => guild.id);
  const query = data.map((guild) => guild.id);

  const result = query.filter((guild_id) => guilds.includes(guild_id));

  return JSON.stringify(result);
}

module.exports.StartRequestHandler = Init;
