const express = require('express');
const Account = require('../models/Account');
const { auth } = require('../middleware/auth');

const ACCOUNT_TYPES = Account.ACCOUNT_TYPES;
const router = express.Router();
router.use(auth());

const TYPE_DEFAULTS = {
  bank: { icon: 'account_balance', color: '#E53935' },
  food_wallet: { icon: 'restaurant', color: '#4CAF50' },
  credit_card: { icon: 'credit_card', color: '#7E57C2' },
};

function normalizeType(value) {
  if (!value) return 'bank';
  if (!ACCOUNT_TYPES.includes(value)) return null;
  return value;
}

function parseNumber(value, fallback) {
  if (value === undefined || value === null || value === '') return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

router.get('/', async (req, res) => {
  const accounts = await Account.find({ userId: req.user._id }).sort({ sortOrder: 1, name: 1 });
  await Promise.all(
    accounts
      .filter((a) => !a.accountType)
      .map(async (a) => {
        a.accountType = 'bank';
        await a.save();
      })
  );
  res.json(accounts);
});

router.post('/', async (req, res) => {
  try {
    const { name, icon, color, sortOrder, accountType, balance, creditLimit } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });
    const type = normalizeType(accountType || 'bank');
    if (!type) {
      return res.status(400).json({ error: `accountType must be one of: ${ACCOUNT_TYPES.join(', ')}` });
    }
    const defaults = TYPE_DEFAULTS[type];
    const limit =
      type === 'credit_card' ? parseNumber(creditLimit, null) : null;
    if (type === 'credit_card' && limit !== null && limit < 0) {
      return res.status(400).json({ error: 'creditLimit must be >= 0' });
    }

    const account = await Account.create({
      userId: req.user._id,
      name: name.trim(),
      accountType: type,
      icon: icon || defaults.icon,
      color: color || defaults.color,
      balance: parseNumber(balance, 0),
      creditLimit: limit,
      sortOrder: sortOrder ?? 0,
    });
    res.status(201).json(account);
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Account name already exists' });
    console.error(err);
    res.status(500).json({ error: 'Failed to create account' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, icon, color, sortOrder, accountType, balance, creditLimit } = req.body;
    const existing = await Account.findOne({ _id: req.params.id, userId: req.user._id });
    if (!existing) return res.status(404).json({ error: 'Account not found' });

    const update = {};
    if (name !== undefined) update.name = name.trim();
    if (icon !== undefined) update.icon = icon;
    if (color !== undefined) update.color = color;
    if (sortOrder !== undefined) update.sortOrder = sortOrder;
    if (balance !== undefined) {
      const bal = parseNumber(balance, null);
      if (bal === null) return res.status(400).json({ error: 'balance must be a number' });
      update.balance = bal;
    }

    let nextType = existing.accountType || 'bank';
    if (accountType !== undefined) {
      const type = normalizeType(accountType);
      if (!type) {
        return res.status(400).json({ error: `accountType must be one of: ${ACCOUNT_TYPES.join(', ')}` });
      }
      update.accountType = type;
      nextType = type;
    }

    if (creditLimit !== undefined || accountType !== undefined) {
      if (nextType === 'credit_card') {
        if (creditLimit !== undefined) {
          const limit = parseNumber(creditLimit, null);
          if (limit === null || limit < 0) {
            return res.status(400).json({ error: 'creditLimit must be a number >= 0' });
          }
          update.creditLimit = limit;
        }
      } else {
        update.creditLimit = null;
      }
    }

    const account = await Account.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      update,
      { new: true }
    );
    res.json(account);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update account' });
  }
});

router.delete('/:id', async (req, res) => {
  const account = await Account.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!account) return res.status(404).json({ error: 'Account not found' });
  res.json({ ok: true });
});

module.exports = router;
