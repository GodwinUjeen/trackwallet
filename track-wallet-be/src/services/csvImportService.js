const { parse } = require('csv-parse/sync');
const mongoose = require('mongoose');
const Account = require('../models/Account');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const { applyTransactionBalances } = require('./balanceService');

async function findOrCreateAccount(userId, name, cache) {
  const key = name.trim().toLowerCase();
  if (cache.accounts.has(key)) return cache.accounts.get(key);
  let account = await Account.findOne({ userId, name: new RegExp(`^${name.trim()}$`, 'i') });
  if (!account) {
    const presets = {
      pluxe: { color: '#4CAF50', icon: 'restaurant', accountType: 'food_wallet' },
      hdfc: { color: '#E53935', icon: 'account_balance', accountType: 'bank' },
      iob: { color: '#1E88E5', icon: 'account_balance', accountType: 'bank' },
    };
    const preset = presets[key] || {
      color: '#4CAF50',
      icon: 'account_balance',
      accountType: 'bank',
    };
    account = await Account.create({
      userId,
      name: name.trim(),
      icon: preset.icon,
      color: preset.color,
      accountType: preset.accountType,
      balance: 0,
    });
  }
  cache.accounts.set(key, account);
  return account;
}

async function findOrCreateCategory(userId, name, type, parentId, cache) {
  const cacheKey = `${type}:${parentId || 'root'}:${name.trim().toLowerCase()}`;
  if (cache.categories.has(cacheKey)) return cache.categories.get(cacheKey);

  let category = await Category.findOne({
    userId,
    type,
    parentId: parentId || null,
    name: new RegExp(`^${name.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
  });

  if (!category) {
    category = await Category.create({
      userId,
      name: name.trim(),
      type,
      parentId: parentId || null,
      icon: 'category',
      color: type === 'income' ? '#43A047' : '#FF9800',
    });
  }
  cache.categories.set(cacheKey, category);
  return category;
}

function parseCsvText(text) {
  return parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  });
}

async function importCsv(userId, csvText) {
  const rows = parseCsvText(csvText);
  const cache = { accounts: new Map(), categories: new Map() };
  let imported = 0;
  let skipped = 0;

  // Group potential transfer pairs by date+note+abs amount
  const transferBuckets = new Map();

  for (const row of rows) {
    const txType = (row.Transaction || '').trim();
    if (!txType) {
      skipped++;
      continue;
    }

    if (txType === 'Transfer') {
      const key = `${row.Date}|${row.Note || ''}|${Math.abs(Number(row.Amount))}`;
      if (!transferBuckets.has(key)) transferBuckets.set(key, []);
      transferBuckets.get(key).push(row);
      continue;
    }

    const type = txType.toLowerCase() === 'income' ? 'income' : 'expense';
    const account = await findOrCreateAccount(userId, row.Account, cache);
    let categoryId = null;
    let subcategoryId = null;

    if (row.Category) {
      // Gifts appears as both income and expense in CSV — use transaction type
      const cat = await findOrCreateCategory(userId, row.Category, type, null, cache);
      categoryId = cat._id;
      if (row.Subcategory) {
        const sub = await findOrCreateCategory(userId, row.Subcategory, type, cat._id, cache);
        subcategoryId = sub._id;
      }
    }

    const amount = Number(row.Amount);
    const tx = await Transaction.create({
      userId,
      type,
      amount,
      currency: row.Currency || 'INR',
      date: new Date(row.Date),
      accountId: account._id,
      categoryId,
      subcategoryId,
      note: row.Note || '',
    });
    await applyTransactionBalances(tx);
    imported++;
  }

  for (const [, group] of transferBuckets) {
    if (group.length < 2) {
      // single transfer leg — import as signed amount on account
      for (const row of group) {
        const account = await findOrCreateAccount(userId, row.Account, cache);
        const amount = Number(row.Amount);
        const tx = await Transaction.create({
          userId,
          type: 'transfer',
          amount,
          currency: row.Currency || 'INR',
          date: new Date(row.Date),
          accountId: account._id,
          note: row.Note || '',
          transferGroupId: new mongoose.Types.ObjectId(),
        });
        await applyTransactionBalances(tx);
        imported++;
      }
      continue;
    }

    const neg = group.find((r) => Number(r.Amount) < 0);
    const pos = group.find((r) => Number(r.Amount) > 0);
    if (!neg || !pos) {
      skipped += group.length;
      continue;
    }

    const fromAcc = await findOrCreateAccount(userId, neg.Account, cache);
    const toAcc = await findOrCreateAccount(userId, pos.Account, cache);
    const groupId = new mongoose.Types.ObjectId();
    const abs = Math.abs(Number(neg.Amount));
    const dt = new Date(neg.Date);
    const note = neg.Note || pos.Note || '';

    const outTx = await Transaction.create({
      userId,
      type: 'transfer',
      amount: -abs,
      currency: neg.Currency || 'INR',
      date: dt,
      accountId: fromAcc._id,
      toAccountId: toAcc._id,
      note,
      transferGroupId: groupId,
    });
    const inTx = await Transaction.create({
      userId,
      type: 'transfer',
      amount: abs,
      currency: pos.Currency || 'INR',
      date: dt,
      accountId: toAcc._id,
      toAccountId: fromAcc._id,
      note,
      transferGroupId: groupId,
    });
    await applyTransactionBalances(outTx);
    await applyTransactionBalances(inTx);
    imported += 2;
  }

  return { imported, skipped, totalRows: rows.length };
}

module.exports = { importCsv, parseCsvText };
