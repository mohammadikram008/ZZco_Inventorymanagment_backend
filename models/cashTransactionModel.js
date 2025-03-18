// models/CashTransaction.js
const mongoose = require('mongoose');

const cashTransactionSchema = new mongoose.Schema({
  cashEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Cash', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['add', 'deduct'], required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

const CashTransaction = mongoose.model('CashTransaction', cashTransactionSchema);
module.exports = CashTransaction;
