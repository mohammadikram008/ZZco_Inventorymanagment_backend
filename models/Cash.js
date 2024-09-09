// models/Bank.js

const mongoose = require("mongoose");

const CashSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
     
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
const Cash = mongoose.model("Cash", CashSchema);
module.exports = Cash;
