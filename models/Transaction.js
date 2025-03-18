const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  bankId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bank', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['add', 'subtract'], required: true },
  description: { type: String, required: true }, // ✅ NEW
  saleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sale' }, // ✅ OPTIONAL
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

const Transaction = mongoose.model('BankTransaction', transactionSchema);

module.exports = Transaction;
