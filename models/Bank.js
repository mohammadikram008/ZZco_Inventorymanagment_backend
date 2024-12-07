const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  // accountNumber: { type: String, required: true },
  balance: { type: Number, required: true, default: 0 },
  transactions: [{ // New field to store transaction history
    amount: { type: Number, required: true },
    type: { type: String, required: true }, // e.g., 'add', 'update', 'sale', etc.
    createdAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
});

const Bank = mongoose.model('Bank', bankSchema);

module.exports = Bank;