require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/mfa', require('./routes/mfa'));
app.use('/api/brackets', require('./routes/bracket'));
app.use('/api/watchlist', require('./routes/watchlist'));
app.use('/api/stats', require('./routes/stats'));
app.get('/', (req, res) => res.send('FoodBracket API running'));

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(process.env.PORT, () => {
            console.log(`Server running on port ${process.env.PORT}`);
        });
    })
    .catch(err => console.error('MongoDB connection error:', err));

