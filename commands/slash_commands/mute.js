module.exports = {
    name: 'mute',
    description: 'Mute a user for an inserted amount of time',
    options: [
        {
            name: 'user',
            description: 'The user to mute',
            type: 'USER',
            required: true
        },
        {
            name: 'time',
            description: 'The amount of time to mute the user for followed by a trailing identifier',
            type: 'STRING',
            required: true
        }
    ],
    async execute(interaction, client) {

        const instanceGuild = interaction.guild

        await interaction.deferReply();
        
        const user = interaction.options.getUser('user');
        if (user.bot) return;
        const time = interaction.options.getString('time');


        const mutedRole = await instanceGuild.roles.cache.find(role => role.name === 'muted');
        const member = await instanceGuild.members.fetch(user.id, {cache:true});
        if (member.permissions.has('ADMINISTRATOR')) return interaction.editReply('You cannot mute an administrator');

        if (!mutedRole) {
            await interaction.editReply('There is no muted role on this server. Please create one and try again.');
            return;
        } else {

            const trailedSymbol = time.slice(time.length - 1);

            switch (trailedSymbol) {
                case 's':
                    var extractedTime = time.slice(0, time.length - 1);
                    break;
                case 'm':
                    var extractedTime = time.slice(0, time.length - 1) * 60;
                    break;
                case 'h':
                    var extractedTime = time.slice(0, time.length - 1) * 60 * 60;
                    break;
                case 'd':
                    var extractedTime = time.slice(0, time.length - 1) * 24 * 60 * 60;
                    break;
            }

            // if (time > 600){
            //     await interaction.editReply('You cannot mute a user for more than 10 minutes.');
            //     return;
            // }

            const confiscatedRoles = [];

            await member.roles.cache.map(role => {
                if (role.name !== 'muted' && role.name !== '@everyone') {
                    confiscatedRoles.push(role);
                    member.roles.remove(role);
                    console.log(`Removed role ${role.name} from ${member.user.username}`);
                }
            });

            await member.roles.add(mutedRole)
            .then(async () => {
                await interaction.editReply(`${member.user.username} has been muted for ${time}.`);
                setTimeout(async () => {
                    for (const role of confiscatedRoles) {
                        await member.roles.add(role);
                        console.log(`Added role ${role.name} back to ${member.user.username}`);
                    }

                    await member.roles.remove(mutedRole);
                    await interaction.editReply(`${member.user.username} has been unmuted.`);
                }, extractedTime * 1000);
            })
        }

    }
}