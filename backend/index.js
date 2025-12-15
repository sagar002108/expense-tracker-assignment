const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// const path = require('path'); // Not needed for Vercel/Render split deployment

const app = express();
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// --- MIDDLEWARES ---
app.use(express.json());
// CORS is critical: It allows your Vercel frontend to talk to this Render backend
app.use(cors()); 

// --- DEBUGGING ---
// This prints incoming requests to the Render logs so you can see if the connection works
app.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});

// --- API ROUTES ---
// Ensure you have the 'routes' folder and 'transactions.js' file created
const router = require('./routes/transactions');
app.use('/api/v1', router);

// --- DB CONNECTION ---
// Make sure 'MONGO_URL' is added in your Render "Environment Variables" settings
const MONGO_URL = process.env.MONGO_URL;

mongoose.connect(MONGO_URL)
    .then(() => {
        console.log('DB Connected Successfully');
        app.listen(PORT, () => {
            console.log(`Server running on port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('DB Connection Failed:', err.message);
    });