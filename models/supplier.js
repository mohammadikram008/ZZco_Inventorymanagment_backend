const mongoose = require("mongoose");

const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

// Transaction schema remains the same
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
    default: {},
  },
});

// Supplier schema remains the same
const supplierSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      // required: true,
      unique: true,
    },
    password: {
      type: String,
      // required: true,
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

// Check if the model is already compiled before defining it
module.exports = mongoose.models.Supplier || mongoose.model("Supplier", supplierSchema);
