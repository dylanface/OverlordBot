const Discord = require('discord.js');

module.exports = {
    name: 'massban',
    description: "Begin the mass ban process for a list of Users",
    options: [{
        name: 'userlist',
        type: 'STRING',
        description: 'Comma separated user id list',
        required: true,
    }],
    async execute(interaction, client) {

        await interaction.deferReply();
        await interaction.member.guild.channels.fetch(null, {cache:true});

        var inputUserList = await interaction.options.getString('userlist');
        
        let userListArray = inputUserList.split(", ");
        console.log(userListArray.length);
        console.log(userListArray);
        
        const reasonSelector = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageSelectMenu()
            .setCustomId('massban_reason_selector')
            .setPlaceholder('Select a default reason for this operation')
            .addOptions([
                {
                    label: 'Spamming',
                    value: ' Spamming Chat',
                },
                {
                    label: 'Bots',
                    value: ' The ',
                },
                {
                    label: 'Abusive Chat',
                    value: 'Other',
                },
                {
                    label: 'Innapropriate Content',
                    value: ' posting innapropriate content in chat',
                },
                {
                    label: 'Other',
                    value: 'Other',
                }


            ])
        )
        
        const massBanEmbed = new Discord.MessageEmbed()
        .setColor('#0099ff')
        .setTitle('Mass Ban')
        .setDescription(`Select default reason for banning (${userListArray.length}) users:`)
        
        // for (const user of userListArray) {
        //     massBanEmbed.addField(`${user}`, `${user}`);
        // }

        interaction.editReply({ embeds: [massBanEmbed], components: [reasonSelector] });

        
    }
}