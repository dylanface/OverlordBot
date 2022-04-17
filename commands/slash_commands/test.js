
module.exports = {
enabled: false,
name: 'test',
description: 'Test command',
options: [
    {
        name: 'as',
        description: 'The user to test as',
        type: 'USER',
        required: false
    }
],
async execute(interaction, client) {
    await interaction.deferReply();

    await interaction.editReply(interaction.locale)

}
}