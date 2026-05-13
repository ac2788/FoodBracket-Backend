const express = require('express');
const router = express.Router();
const Bracket = require('../models/Bracket');
const Stats = require('../models/Stats');
const jwt = require('jsonwebtoken');

// Create bracket
router.post('/create', async (req, res) => {
    try {
        const { name, foods, createdBy } = req.body;
        if (foods.length < 2) return res.status(400).json({ message: 'Need at least 2 foods' });

        const matchups = [];
        for (let i = 0; i < foods.length - 1; i += 2) {
            matchups.push({
                food1: foods[i],
                food2: foods[i + 1] || 'BYE',
                votes1: 0,
                votes2: 0,
                winner: foods[i + 1] ? null : foods[i],
                voters: [],
                round: 1
            });
        }

        const bracket = new Bracket({ name, foods, createdBy, matchups, currentRound: 1 });
        await bracket.save();
        res.status(201).json(bracket);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all brackets
router.get('/', async (req, res) => {
    try {
        const brackets = await Bracket.find().sort({ createdAt: -1 });
        res.json(brackets);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single bracket
router.get('/:id', async (req, res) => {
    try {
        const bracket = await Bracket.findById(req.params.id);
        if (!bracket) return res.status(404).json({ message: 'Bracket not found' });
        res.json(bracket);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Vote on matchup
router.post('/:id/vote', async (req, res) => {
    try {
        const { matchupIndex, vote, userId } = req.body;
        const bracket = await Bracket.findById(req.params.id);
        if (!bracket) return res.status(404).json({ message: 'Bracket not found' });

        const matchup = bracket.matchups[matchupIndex];

        if (matchup.winner) return res.status(400).json({ message: 'Matchup already has a winner' });

        if (matchup.voters && matchup.voters.includes(userId)) {
            return res.status(400).json({ message: 'You already voted on this matchup!' });
        }

        if (vote === 1) matchup.votes1++;
        else matchup.votes2++;

        matchup.voters = matchup.voters || [];
        matchup.voters.push(userId);

        // Determine winner at 2 votes
        if (matchup.votes1 >= 2 || matchup.votes2 >= 2) {
            matchup.winner = matchup.votes1 >= 2 ? matchup.food1 : matchup.food2;
            const loser = matchup.winner === matchup.food1 ? matchup.food2 : matchup.food1;

            // Record stats
            await Stats.findOneAndUpdate({ foodName: matchup.winner }, { $inc: { wins: 1 } }, { upsert: true });
            await Stats.findOneAndUpdate({ foodName: loser }, { $inc: { losses: 1 } }, { upsert: true });

            // Check if all matchups in current round are done
            const currentRoundMatchups = bracket.matchups.filter(m => m.round === bracket.currentRound);
            const allDone = currentRoundMatchups.every(m => m.winner !== null);

            if (allDone) {
                const winners = currentRoundMatchups.map(m => m.winner);
                if (winners.length === 1) {
                    // Tournament champion!
                    bracket.status = 'completed';
                    bracket.champion = winners[0];
                } else {
                    // Create next round matchups
                    bracket.currentRound += 1;
                    for (let i = 0; i < winners.length - 1; i += 2) {
                        bracket.matchups.push({
                            food1: winners[i],
                            food2: winners[i + 1] || 'BYE',
                            votes1: 0,
                            votes2: 0,
                            winner: winners[i + 1] ? null : winners[i],
                            voters: [],
                            round: bracket.currentRound
                        });
                    }
                }
            }
        }

        await bracket.save();
        res.json(bracket);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
