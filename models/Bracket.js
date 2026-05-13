const mongoose = require('mongoose');

const MatchupSchema = new mongoose.Schema({
    food1: { type: String, required: true },
    food2: { type: String, required: true },
    votes1: { type: Number, default: 0 },
    votes2: { type: Number, default: 0 },
    winner: { type: String, default: null },
    voters: [String],
    round: { type: Number, default: 1 }
});

const BracketSchema = new mongoose.Schema({
    name: { type: String, required: true },
    createdBy: { type: String, required: true },
    foods: [String],
    matchups: [MatchupSchema],
    currentRound: { type: Number, default: 1 },
    champion: { type: String, default: null },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bracket', BracketSchema);
