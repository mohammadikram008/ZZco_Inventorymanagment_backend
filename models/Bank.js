// models/Bank.js

const mongoose = require("mongoose");

const BankSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      required: [true, "Please add a bank name"],
    },
    amount: {
      type: Number,
      required: [true, "Please add an amount"],
    },
  },
  {
    timestamps: true,
  }
);

// Ensure that you are exporting the Bank model correctly
const Bank = mongoose.model("Bank", BankSchema);
module.exports = Bank;
