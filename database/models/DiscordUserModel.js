const mongoose = require('mongoose');
const { Schema } = mongoose;

const DiscordUserSchema = new Schema({
    id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    discriminator: {
        type: String,
        required: true,
    },
    stats: {
        type: Object,
        required: true
    },
    moderation: {
        type: Object,
        required: true
    }
})

/**
 * @type {mongoose.Model}
 */
const DiscordUserModel = mongoose.model('DiscordUser', DiscordUserSchema, 'discord_users');

module.exports = DiscordUserModel;