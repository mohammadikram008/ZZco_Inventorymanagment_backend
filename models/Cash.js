const mongoose = require('mongoose');

const cashSchema = new mongoose.Schema({
  balance: { type: Number, required: true },
  totalBalance: { type: Number, required: true },
  type: { type: String, enum: ['add', 'deduct'], required: true },
}, {
  timestamps: true,
});

const Cash = mongoose.model('Cash', cashSchema);

module.exports = Cash;