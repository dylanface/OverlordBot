module.exports = async (Discord, client, interaction, message) => { 
    if (!interaction.isCommand()) return;

    const sCommandName = interaction.commandName;
    const sCommand = client.slashCommands.get(sCommandName);

    try {
        sCommand.execute(interaction, client);
    } catch (error) {
        console.log(error);
    }

}