const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { codeBlock } = require("@discordjs/builders");

const tones = new Map([
  ["/j", "Joking"],
  ["/hj", "Half-joking"],
  ["/s", "Sarcastic"],
  ["/gen", "Genuine"],
  ["/g", "Genuine"],
  ["/srs", "Serious"],
  ["/nsrs", "Non-serious"],
  ["/pos", "Positive Connotation"],
  ["/pc", "Positive Connotation"],
  ["/neu", "Neutral Connotation"],
  ["/neg", "Negative Connotation"],
  ["/nc", "Negative Connotation"],
  ["/p", "Platonic"],
  ["/r", "Romantic"],
  ["/c", "Copypasta"],
  ["/l", "Song Lyrics"],
  ["/ly", "Song Lyrics"],
  ["/lh", "Light-hearted"],
  ["/nm", "Not Mad"],
  ["/lu", "A Little Upset"],
  ["/nbh", "Nobody Here"],
  ["/nsb", "Not Subtweeting"],
  ["/sx", "Sexual Intent"],
  ["/x", "Sexual Intent"],
  ["/nsx", "Non-sexual Intent"],
  ["/nx", "Non-sexual Intent"],
  ["/rh", "Rhetorical Question"],
  ["/rt", "Rhetorical Question"],
  ["/t", "Teasing"],
  ["/ij", "Inside Joke"],
  ["/m", "Metaphorically"],
  ["/li", "Literally"],
  ["/hyp", "Hyperbole"],
  ["/f", "Fake"],
  ["/th", "Threat"],
  ["/cb", "Clickbait"],
]);

const toneIndicatorsRegex =
  /(?:\/j|\/hj|\/s|\/gen|\/g|\/srs|\/nsrs|\/pos|\/pc|\/neu|\/neg|\/nc|\/p|\/r|\/c|\/l|\/ly|\/lh|\/nm|\/lu|\/nbh|\/nsb|\/sx|\/x|\/nsx|\/nx|\/rh|\/rt|\/t|\/ij|\/m|\/li|\/hyp|\/f|\/th|\/cb)\b/gi;


module.exports = {
    enabled: true,
    name: "tone_decoder",
    description: "Decode tone indicators included in a text based message.",
    data: new ContextMenuCommandBuilder()
        .setName("tone_decoder")
        .setType(3)
        .setDMPermission(false),
    execute: async (interaction, client) => {
        
        if (!interaction.targetMessage || !interaction.targetMessage.content) return;

        const messageContent = interaction.targetMessage.content;
        const messageTones = [];

        const found = messageContent.match(toneIndicatorsRegex);

        if (!found) return interaction.reply("No tone indicators found.");


        for (const tone of found) {
            const toneName = tones.get(tone);
            if (toneName) {
                messageTones.push(toneName);
            }
        }

        if (messageTones.length > 0) {
            interaction.reply(codeBlock(
                `Message: ${messageContent}\nTones: ${messageTones.join(", ")}`
                ));
        } else interaction.reply("No tone indicators found.");
    }
}