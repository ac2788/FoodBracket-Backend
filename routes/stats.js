const express = require('express');
const router = express.Router();
const Stats = require('../models/Stats');

// Get all stats
router.get('/', async (req, res) => {
    try {
        const stats = await Stats.find().sort({ wins: -1 });
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update stats when winner is decided
router.post('/update', async (req, res) => {
    try {
        const { winner, loser } = req.body;

        await Stats.findOneAndUpdate(
            { foodName: winner },
            { $inc: { wins: 1 } },
            { upsert: true, new: true }
        );

        await Stats.findOneAndUpdate(
            { foodName: loser },
            { $inc: { losses: 1 } },
            { upsert: true, new: true }
        );

        res.json({ message: 'Stats updated' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
