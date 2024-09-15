const mongoose = require("mongoose");

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Online', 'Cheque'],  // Capitalized enum values
    required: true,
    set: capitalizeFirstLetter,  // Ensure the value is capitalized
  },
  chequeDate: {
    type: Date,
  },
  description: {
    type: String,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    required: true,
  },
  bankName: {
    type: String,
  },
  cashAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cash',
  },
  image: {
    type: Object,
    default: {}
  },
});


const supplierSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    address: {
      type: String,
    },
    balance: {
      type: Number,
      default: 0,
    },
    transactionHistory: [transactionSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Supplier", supplierSchema);