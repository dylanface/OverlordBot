const Discord = require('discord.js');

module.exports = {
	name: 'message',
	async execute (message, client) {

		const prefix = '+';
		if(!message.content.startsWith(prefix) || message.author.bot) return;

		let args = message.content.slice(prefix.length).split(/ +/);
		const commandName = args.shift().toLowerCase();
		const command = client.commands.get(commandName)
			|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command) return;

		if (command.guildOnly && message.channel.type === 'dm') {
			return message.reply('I can\'t execute that command inside DMs!');
		}

		if (command.permissions) {
			const authorPerms = message.channel.permissionsFor(message.author);
			if (!authorPerms || !authorPerms.has(command.permissions)) {
				return message.reply('You can not do this!');
			}
		}

		if (command.args && !args.length) {
			let reply = `You didn't provide any arguments, ${message.author}!`;

			if (command.usage) {
				reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
			}

			return message.channel.send(reply);
		}

		if (command.guildExclusive) {
			const guildAvailable = message.guild.available;
			if (guildAvailable) {
				const guildID = message.guild.id;
				const accessGuildID = command.guildExclusive;

				if (guildID != accessGuildID) {
					return message.channel.send(`Very sneaky, you typed a valid command but it is locked for this server: ${message.guild.name}`);
				}
			}
		}

		const { cooldowns } = client;

		if (!cooldowns.has(command.name)) {
			cooldowns.set(command.name, new Discord.Collection());
		}

		const now = Date.now();
		const timestamps = cooldowns.get(command.name);
		const cooldownAmount = (command.cooldown || 3) * 1000;

		if (timestamps.has(message.author.id)) {
			const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {
			command.execute(client, message, args, Discord);
		} catch (error) {

			const errorEmbed = new Discord.MessageEmbed()
				.setTitle(`❌ There was an error while executing your command ❌`)
				.setDescription(`The following error caused your command to fail during execution:
				\`${error}\`. This is most likely not intended, please contact <@265023187614433282> to report this error.`);

			channel.send(errorEmbed);
		}
    
	}
}