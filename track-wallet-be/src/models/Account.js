const mongoose = require('mongoose');

const ACCOUNT_TYPES = ['bank', 'food_wallet', 'credit_card'];

const accountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    accountType: {
      type: String,
      enum: ACCOUNT_TYPES,
      default: 'bank',
      required: true,
    },
    icon: { type: String, default: 'account_balance' },
    color: { type: String, default: '#4CAF50' },
    balance: { type: Number, default: 0 },
    creditLimit: { type: Number, default: null },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

accountSchema.index({ userId: 1, name: 1 }, { unique: true });

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;
module.exports.ACCOUNT_TYPES = ACCOUNT_TYPES;
