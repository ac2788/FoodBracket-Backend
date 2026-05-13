const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');

const mfaCodes = {};

// Send MFA code
router.post('/send-code', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        mfaCodes[email] = { code, expires: Date.now() + 10 * 60 * 1000 };

        // Send email in background - don't await
        axios.post('http://192.168.10.1:4000/send-email', { to: email, code })
            .catch(err => console.error('Email error:', err));

        // Respond immediately
        res.json({ message: 'Code sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to send code' });
    }
});
// Verify MFA code
router.post('/verify-code', async (req, res) => {
    try {
        const { email, code } = req.body;
        const record = mfaCodes[email];

        if (!record) return res.status(400).json({ message: 'No code found' });
        if (Date.now() > record.expires) return res.status(400).json({ message: 'Code expired' });
        if (record.code !== code) return res.status(400).json({ message: 'Invalid code' });

        delete mfaCodes[email];
        res.json({ message: 'Verified successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
