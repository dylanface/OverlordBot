const Discord = require('discord.js');
const { DiscordTogether } = require('discord-together');
const { PinBoardManager } = require('./managers/PinBoardManager');
// const { REST } = require('@discordjs/rest');
// const { Routes } = require('discord-api-types/v9');


require("dotenv").config();
const Users = require('./database/dbObjects');
const { Op } = require('sequelize');


const myIntents = Discord.Intents.ALL;
const client = new Discord.Client({ partials: ["MESSAGE", "CHANNEL", "REACTION" ], intents: 32767 });


const token = process.env.TEST_TOKEN

client.discordTogether = new DiscordTogether(client);

client.pinBoardManager = new PinBoardManager(client);
client.pinMeGuildsCache = new Discord.Collection();
client.pinMeRegistry = new Discord.Collection();


client.currency = new Discord.Collection();
client.slashCommands = new Discord.Collection();
client.commands = new Discord.Collection();
client.events = new Discord.Collection();
client.cooldowns = new Discord.Collection();

Reflect.defineProperty(client.currency, 'add', {
	/* eslint-disable-next-line func-name-matching */
	value: async function add(id, amount) {
		const userEcon = client.currency.get(id);
		const user = await client.users.fetch(id, true)
		const tag = user.tag

		if (userEcon) {
			userEcon.balance += Number(amount);
			return userEcon.save();
		}
		const newUser = await Users.create({ user_id: id, user_tag: tag, balance: amount });
		client.currency.set(id, newUser);
		return newUser;
	},
});

Reflect.defineProperty(client.currency, 'getBalance', {
	/* eslint-disable-next-line func-name-matching */
	value: function getBalance(id) {
		const user = client.currency.get(id);
		return user ? user.balance : 0;
	},
});

['command_handler', 'slash_cmd_handler', 'event_handler'].forEach(handler => {
    require(`./handlers/${handler}`)(client, Discord);
})

client.login(token)
