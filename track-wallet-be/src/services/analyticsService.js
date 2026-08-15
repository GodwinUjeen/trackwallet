const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const Category = require('../models/Category');
const mongoose = require('mongoose');

function monthRange(year, month) {
  const y = Number(year);
  const m = Number(month);
  const from = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0, 0));
  const to = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));
  return { from, to };
}

function prevMonth(year, month) {
  const d = new Date(Date.UTC(Number(year), Number(month) - 2, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

async function getSummary(userId, year, month) {
  const { from, to } = monthRange(year, month);
  const rows = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: from, $lte: to },
        type: { $in: ['income', 'expense'] },
      },
    },
    {
      $group: {
        _id: '$type',
        total: { $sum: { $abs: '$amount' } },
      },
    },
  ]);

  let income = 0;
  let expense = 0;
  for (const r of rows) {
    if (r._id === 'income') income = r.total;
    if (r._id === 'expense') expense = r.total;
  }
  return { income, expense, net: income - expense, from, to };
}

async function getByCategory(userId, year, month, type = 'expense') {
  const { from, to } = monthRange(year, month);
  const rows = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: from, $lte: to },
        type,
        categoryId: { $ne: null },
      },
    },
    {
      $group: {
        _id: '$categoryId',
        amount: { $sum: { $abs: '$amount' } },
      },
    },
    { $sort: { amount: -1 } },
  ]);

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const ids = rows.map((r) => r._id);
  const cats = await Category.find({ _id: { $in: ids } });
  const byId = Object.fromEntries(cats.map((c) => [c._id.toString(), c]));

  return {
    total,
    categories: rows.map((r) => {
      const cat = byId[r._id.toString()];
      return {
        categoryId: r._id,
        name: cat?.name || 'Unknown',
        icon: cat?.icon || 'category',
        color: cat?.color || '#9E9E9E',
        amount: r.amount,
        percent: total ? Math.round((r.amount / total) * 100) : 0,
      };
    }),
  };
}

async function getTimeseries(userId, year, month) {
  const { from, to } = monthRange(year, month);
  const rows = await Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        date: { $gte: from, $lte: to },
        type: { $in: ['income', 'expense'] },
      },
    },
    {
      $group: {
        _id: {
          day: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          type: '$type',
        },
        total: { $sum: { $abs: '$amount' } },
      },
    },
    { $sort: { '_id.day': 1 } },
  ]);

  const daysInMonth = to.getUTCDate();
  const series = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const day = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    series.push({ date: day, income: 0, expense: 0 });
  }
  const map = Object.fromEntries(series.map((s) => [s.date, s]));
  for (const r of rows) {
    if (map[r._id.day]) {
      map[r._id.day][r._id.type] = r.total;
    }
  }
  return series.map((s) => ({
    ...s,
    total: s.income - s.expense,
  }));
}

async function getAverages(userId, year, month) {
  const summary = await getSummary(userId, year, month);
  const days = summary.to.getUTCDate();
  const weeks = days / 7;
  return {
    day: { income: summary.income / days, expense: summary.expense / days },
    week: { income: summary.income / weeks, expense: summary.expense / weeks },
    month: { income: summary.income, expense: summary.expense },
  };
}

async function getCompare(userId, year, month) {
  const current = await getSummary(userId, year, month);
  const prev = prevMonth(year, month);
  const previous = await getSummary(userId, prev.year, prev.month);

  function delta(cur, prevVal) {
    const amount = cur - prevVal;
    const percent = prevVal === 0 ? (cur === 0 ? 0 : 100) : Math.round((amount / prevVal) * 100);
    return { amount, percent };
  }

  return {
    current: { income: current.income, expense: current.expense, net: current.net },
    previous: {
      year: prev.year,
      month: prev.month,
      income: previous.income,
      expense: previous.expense,
      net: previous.net,
    },
    change: {
      income: delta(current.income, previous.income),
      expense: delta(current.expense, previous.expense),
    },
  };
}

async function getBalanceSeries(userId, year, month) {
  const { from, to } = monthRange(year, month);
  const accounts = await Account.find({ userId });
  const cashAccounts = accounts.filter((a) => a.accountType !== 'credit_card');
  const cashIds = new Set(cashAccounts.map((a) => String(a._id)));
  const isCashTx = (tx) => cashIds.has(String(tx.accountId));
  const currentTotal = cashAccounts.reduce((s, a) => s + a.balance, 0);

  // Reconstruct historical total balance by walking transactions after `to` backwards is complex;
  // instead: start from current, reverse all txs after `to`, then walk day by day in month.
  const after = await Transaction.find({
    userId,
    date: { $gt: to },
  }).sort({ date: -1 });

  let balance = currentTotal;
  for (const tx of after) {
    if (!isCashTx(tx)) continue;
    balance -= tx.amount; // reverse: income positive amount, expense negative — subtracting restores prior
  }

  // Now `balance` is end-of-month (or latest before after). Walk month days with txs in month.
  const inMonth = (
    await Transaction.find({
      userId,
      date: { $gte: from, $lte: to },
    }).sort({ date: 1 })
  ).filter(isCashTx);

  // Start-of-month balance: reverse in-month txs
  let startBalance = balance;
  for (let i = inMonth.length - 1; i >= 0; i--) {
    startBalance -= inMonth[i].amount;
  }

  const daysInMonth = to.getUTCDate();
  const today = new Date();
  const series = [];
  let running = startBalance;
  let txIdx = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dayStart = new Date(Date.UTC(Number(year), Number(month) - 1, d, 0, 0, 0, 0));
    const dayEnd = new Date(Date.UTC(Number(year), Number(month) - 1, d, 23, 59, 59, 999));

    // Don't project future days beyond today if current month
    const isFuture =
      dayStart > today &&
      Number(year) === today.getFullYear() &&
      Number(month) === today.getMonth() + 1;

    while (txIdx < inMonth.length && inMonth[txIdx].date <= dayEnd) {
      running += inMonth[txIdx].amount;
      txIdx++;
    }

    if (!isFuture || d === 1) {
      series.push({
        date: `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
        balance: running,
      });
    } else {
      break;
    }
  }

  return { currentTotal, series };
}

module.exports = {
  monthRange,
  getSummary,
  getByCategory,
  getTimeseries,
  getAverages,
  getCompare,
  getBalanceSeries,
};
