const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const router = require('./routes/transactions');

require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Middlewares
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/v1', router);

// Database Connection
const MONGO_URL = process.env.MONGO_URL || "mongodb://localhost:27017/expense_tracker_db"; // Make sure Mongo is running!

mongoose.connect(MONGO_URL)
    .then(() => {
        console.log('DB Connected');
        app.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`);
        });
    })
    .catch((err) => console.log(err));