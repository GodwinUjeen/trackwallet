const Account = require('../models/Account');

async function applyBalanceDelta(accountId, delta, session) {
  const opts = session ? { session } : {};
  const account = await Account.findByIdAndUpdate(
    accountId,
    { $inc: { balance: delta } },
    { new: true, ...opts }
  );
  if (!account) throw new Error('Account not found');
  return account;
}

/** Compute signed balance impact for one transaction document on its accountId. */
function impactForLeg(tx) {
  if (tx.type === 'income') return Math.abs(tx.amount);
  if (tx.type === 'expense') return -Math.abs(tx.amount);
  // transfer: amount is signed relative to accountId (negative = leaving, positive = arriving)
  return tx.amount;
}

async function applyTransactionBalances(tx, session) {
  await applyBalanceDelta(tx.accountId, impactForLeg(tx), session);
}

async function reverseTransactionBalances(tx, session) {
  await applyBalanceDelta(tx.accountId, -impactForLeg(tx), session);
}

module.exports = {
  applyBalanceDelta,
  impactForLeg,
  applyTransactionBalances,
  reverseTransactionBalances,
};
