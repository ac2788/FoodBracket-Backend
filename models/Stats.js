const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
    foodName: { type: String, required: true, unique: true },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 }
});

module.exports = mongoose.model('Stats', StatsSchema);
