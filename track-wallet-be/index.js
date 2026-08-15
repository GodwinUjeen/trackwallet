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
const port = process.env.PORT || 3000;

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/import', importRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  await connectDb();
  app.listen(port, () => console.log(`TrackWallet API on http://localhost:${port}`));
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
