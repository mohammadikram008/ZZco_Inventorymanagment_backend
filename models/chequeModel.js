const mongoose = require('mongoose');

const chequeSchema = mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, "Please add a cheque date"],
    },
    amount: {
      type: Number,
      required: [true, "Please add the cheque amount"],
    },
    bank: {
      type: String,
      required: [true, "Please add the bank name"],
    },
    transactionType: {
      type: String,
      enum: ['buy', 'sale'],
      required: [true, "Please specify if this is for a buy or sale transaction"],
    },
    status: {
      type: Boolean,
      default: false,
    },
    relatedTransaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: [true, "Please link this cheque to a transaction"],
    },
  },
  {
    timestamps: true,
  }
);

const Cheque = mongoose.model('Cheque', chequeSchema);
module.exports = Cheque;
