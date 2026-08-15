const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['income', 'expense', 'transfer'], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    date: { type: Date, required: true, index: true },
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true },
    toAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    subcategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    note: { type: String, default: '' },
    transferGroupId: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1, date: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);
