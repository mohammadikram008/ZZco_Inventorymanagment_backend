const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    expenseName: {
      type: String,
      required: [true, "Please add an expense name"],
    },
    amount: {
      type: Number,
      required: [true, "Please add an amount"],
    },
    description: {
      type: String,
      required: [true, "Please add a description"],
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

const Expense = mongoose.model("Expense", ExpenseSchema);
module.exports = Expense;
