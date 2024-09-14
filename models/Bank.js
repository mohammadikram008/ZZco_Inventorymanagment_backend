const mongoose = require('mongoose');

const bankSchema = new mongoose.Schema({
  bankName: { type: String, required: true },
  // accountNumber: { type: String, required: true },
  balance: { type: Number, required: true, default: 0 },
}, {
  timestamps: true,
});

const Bank = mongoose.model('Bank', bankSchema);

module.exports = Bank;