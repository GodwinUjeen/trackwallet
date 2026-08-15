const express = require('express');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Account = require('../models/Account');
const { auth } = require('../middleware/auth');
const {
  applyTransactionBalances,
  reverseTransactionBalances,
} = require('../services/balanceService');

const router = express.Router();
router.use(auth());

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/', async (req, res) => {
  try {
    const filter = { userId: req.user._id };
    if (req.query.from || req.query.to) {
      filter.date = {};
      if (req.query.from) filter.date.$gte = new Date(req.query.from);
      if (req.query.to) filter.date.$lte = new Date(req.query.to);
    }
    if (req.query.type) {
      const types = String(req.query.type).split(',').filter(Boolean);
      if (types.length === 1) filter.type = types[0];
      else if (types.length > 1) filter.type = { $in: types };
    }
    if (req.query.accountIds) {
      const ids = String(req.query.accountIds)
        .split(',')
        .filter(Boolean)
        .map((id) => new mongoose.Types.ObjectId(id));
      if (ids.length) filter.accountId = { $in: ids };
    }
    if (req.query.categoryIds) {
      const ids = String(req.query.categoryIds)
        .split(',')
        .filter(Boolean)
        .map((id) => new mongoose.Types.ObjectId(id));
      if (ids.length) {
        filter.$or = [{ categoryId: { $in: ids } }, { subcategoryId: { $in: ids } }];
      }
    }
    if (req.query.search) {
      filter.note = { $regex: escapeRegex(req.query.search), $options: 'i' };
    }

    const transactions = await Transaction.find(filter)
      .sort({ date: -1 })
      .populate('accountId', 'name icon color')
      .populate('toAccountId', 'name icon color')
      .populate('categoryId', 'name icon color type')
      .populate('subcategoryId', 'name icon color');

    res.json(transactions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to list transactions' });
  }
});

router.get('/:id', async (req, res) => {
  const tx = await Transaction.findOne({ _id: req.params.id, userId: req.user._id })
    .populate('accountId', 'name icon color')
    .populate('toAccountId', 'name icon color')
    .populate('categoryId', 'name icon color type')
    .populate('subcategoryId', 'name icon color');
  if (!tx) return res.status(404).json({ error: 'Transaction not found' });
  res.json(tx);
});

async function assertAccount(userId, accountId) {
  const account = await Account.findOne({ _id: accountId, userId });
  if (!account) throw Object.assign(new Error('Account not found'), { status: 404 });
  return account;
}

router.post('/', async (req, res) => {
  try {
    const {
      type,
      amount,
      currency,
      date,
      accountId,
      toAccountId,
      categoryId,
      subcategoryId,
      note,
    } = req.body;

    if (!type || amount === undefined || !date || !accountId) {
      return res.status(400).json({ error: 'type, amount, date, and accountId are required' });
    }

    await assertAccount(req.user._id, accountId);

    if (type === 'transfer') {
      if (!toAccountId) {
        return res.status(400).json({ error: 'toAccountId is required for transfers' });
      }
      await assertAccount(req.user._id, toAccountId);
      const abs = Math.abs(Number(amount));
      const groupId = new mongoose.Types.ObjectId();
      const dt = new Date(date);

      const outTx = await Transaction.create({
        userId: req.user._id,
        type: 'transfer',
        amount: -abs,
        currency: currency || 'INR',
        date: dt,
        accountId,
        toAccountId,
        note: note || '',
        transferGroupId: groupId,
      });
      const inTx = await Transaction.create({
        userId: req.user._id,
        type: 'transfer',
        amount: abs,
        currency: currency || 'INR',
        date: dt,
        accountId: toAccountId,
        toAccountId: accountId,
        note: note || '',
        transferGroupId: groupId,
      });

      await applyTransactionBalances(outTx);
      await applyTransactionBalances(inTx);

      const populated = await Transaction.findById(outTx._id)
        .populate('accountId', 'name icon color')
        .populate('toAccountId', 'name icon color');
      return res.status(201).json(populated);
    }

    const signed =
      type === 'expense' ? -Math.abs(Number(amount)) : Math.abs(Number(amount));

    const tx = await Transaction.create({
      userId: req.user._id,
      type,
      amount: signed,
      currency: currency || 'INR',
      date: new Date(date),
      accountId,
      categoryId: categoryId || null,
      subcategoryId: subcategoryId || null,
      note: note || '',
    });
    await applyTransactionBalances(tx);

    const populated = await Transaction.findById(tx._id)
      .populate('accountId', 'name icon color')
      .populate('categoryId', 'name icon color type')
      .populate('subcategoryId', 'name icon color');
    res.status(201).json(populated);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Failed to create transaction' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const existing = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (existing.type === 'transfer' || existing.transferGroupId) {
      return res.status(400).json({
        error: 'Editing transfers is not supported; delete and recreate',
      });
    }

    await reverseTransactionBalances(existing);

    const { type, amount, currency, date, accountId, categoryId, subcategoryId, note } =
      req.body;

    if (accountId) await assertAccount(req.user._id, accountId);

    const newType = type || existing.type;
    const rawAmount = amount !== undefined ? Number(amount) : Math.abs(existing.amount);
    existing.type = newType;
    existing.amount =
      newType === 'expense' ? -Math.abs(rawAmount) : Math.abs(rawAmount);
    if (currency !== undefined) existing.currency = currency;
    if (date !== undefined) existing.date = new Date(date);
    if (accountId !== undefined) existing.accountId = accountId;
    if (categoryId !== undefined) existing.categoryId = categoryId || null;
    if (subcategoryId !== undefined) existing.subcategoryId = subcategoryId || null;
    if (note !== undefined) existing.note = note;

    await existing.save();
    await applyTransactionBalances(existing);

    const populated = await Transaction.findById(existing._id)
      .populate('accountId', 'name icon color')
      .populate('categoryId', 'name icon color type')
      .populate('subcategoryId', 'name icon color');
    res.json(populated);
  } catch (err) {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || 'Failed to update transaction' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const existing = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!existing) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (existing.transferGroupId) {
      const legs = await Transaction.find({
        userId: req.user._id,
        transferGroupId: existing.transferGroupId,
      });
      for (const leg of legs) {
        await reverseTransactionBalances(leg);
        await leg.deleteOne();
      }
    } else {
      await reverseTransactionBalances(existing);
      await existing.deleteOne();
    }

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

module.exports = router;
