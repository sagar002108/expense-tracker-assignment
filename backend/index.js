const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); // <--- 1. ADD THIS IMPORT

const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cors());

// API Routes
const router = require('./routes/transactions');
app.use('/api/v1', router);

// --- 2. ADD THIS SECTION: SERVE FRONTEND ---
app.use(express.static(path.join(__dirname, 'public')));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// -------------------------------------------

const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
    .then(() => {
        console.log('DB Connected');
        app.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`);
        });
    })
    .catch((err) => console.log(err));

    // Deploy Update 1