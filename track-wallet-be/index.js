require('dotenv').config({ quiet: true });

const express = require('express');
const cors = require('cors');
const { connectDb } = require('./src/config/db');

const authRoutes = require('./src/routes/auth');
const accountRoutes = require('./src/routes/accounts');
const categoryRoutes = require('./src/routes/categories');
const transactionRoutes = require('./src/routes/transactions');
const analyticsRoutes = require('./src/routes/analytics');
const importRoutes = require('./src/routes/import');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow requests without an Origin header
            // (curl, server-to-server requests, etc.)
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
    })
);

app.use(express.json({ limit: '2mb' }));

// Connect to MongoDB before handling API requests
app.use(async (_req, _res, next) => {
    try {
        await connectDb();
        next();
    } catch (error) {
        console.error('MongoDB connection failed:', error);
        next(error);
    }
});

app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/import', importRoutes);

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({
        error: 'Internal server error',
    });
});

module.exports = app;