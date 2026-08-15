const express = require('express');
const { auth } = require('../middleware/auth');
const {
  getSummary,
  getByCategory,
  getTimeseries,
  getAverages,
  getCompare,
  getBalanceSeries,
} = require('../services/analyticsService');

const router = express.Router();
router.use(auth());

function parseMonthYear(req, res) {
  const month = Number(req.query.month);
  const year = Number(req.query.year);
  if (!month || !year || month < 1 || month > 12) {
    res.status(400).json({ error: 'month (1-12) and year are required' });
    return null;
  }
  return { month, year };
}

router.get('/summary', async (req, res) => {
  const my = parseMonthYear(req, res);
  if (!my) return;
  const data = await getSummary(req.user._id, my.year, my.month);
  res.json(data);
});

router.get('/by-category', async (req, res) => {
  const my = parseMonthYear(req, res);
  if (!my) return;
  const type = req.query.type === 'income' ? 'income' : 'expense';
  const data = await getByCategory(req.user._id, my.year, my.month, type);
  res.json(data);
});

router.get('/timeseries', async (req, res) => {
  const my = parseMonthYear(req, res);
  if (!my) return;
  const data = await getTimeseries(req.user._id, my.year, my.month);
  res.json(data);
});

router.get('/averages', async (req, res) => {
  const my = parseMonthYear(req, res);
  if (!my) return;
  const data = await getAverages(req.user._id, my.year, my.month);
  res.json(data);
});

router.get('/compare', async (req, res) => {
  const my = parseMonthYear(req, res);
  if (!my) return;
  const data = await getCompare(req.user._id, my.year, my.month);
  res.json(data);
});

router.get('/balance-series', async (req, res) => {
  const my = parseMonthYear(req, res);
  if (!my) return;
  const data = await getBalanceSeries(req.user._id, my.year, my.month);
  res.json(data);
});

module.exports = router;
