const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['spectator', 'fighter', 'admin'], default: 'spectator' },
    watchlist: [{ name: String, thumbnail: String, category: String }]
});

module.exports = mongoose.model('User', UserSchema);
