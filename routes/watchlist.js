const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');

const getUser = (req) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return null;
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
};

// Get watchlist
router.get('/', async (req, res) => {
    try {
        const user = getUser(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        const found = await User.findById(user.id);
        res.json(found.watchlist);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add to watchlist
router.post('/add', async (req, res) => {
    try {
        const user = getUser(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        const { name, thumbnail, category } = req.body;
        const found = await User.findById(user.id);
        const exists = found.watchlist.find(f => f.name === name);
        if (exists) return res.status(400).json({ message: 'Already in watchlist' });
        found.watchlist.push({ name, thumbnail, category });
        await found.save();
        res.json({ message: 'Added to watchlist' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Remove from watchlist
router.post('/remove', async (req, res) => {
    try {
        const user = getUser(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        const { name } = req.body;
        const found = await User.findById(user.id);
        found.watchlist = found.watchlist.filter(f => f.name !== name);
        await found.save();
        res.json({ message: 'Removed from watchlist' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
