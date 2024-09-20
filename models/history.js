const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    // enum: ['ADD_PRODUCT', 'SALE_PRODUCT', 'ADD_BALANCE', 'MINUS_BALANCE', 'UPDATE_PRODUCT', 'RECEIVE_PRODUCT'],
    required: true
  },
  entityType: {
    type: String,
    enum: ['PRODUCT', 'SALE', 'CUSTOMER', 'SUPPLIER'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  quantity: {
    type: Number,
    // required: true
  },
  amount: {
    type: Number,
    // required: true
  },
  debit: Number,
  credit: Number,
  balance: Number,
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('History', HistorySchema);